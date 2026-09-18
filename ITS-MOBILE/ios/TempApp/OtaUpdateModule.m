#import "OtaUpdateModule.h"
#import <React/RCTReloadCommand.h>
#import <zlib.h>

@interface OtaUpdateModule () <NSURLSessionDownloadDelegate>
@property (nonatomic, copy) RCTPromiseResolveBlock downloadResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock downloadReject;
@property (nonatomic, strong) NSString *targetVersion;
@end

static NSString *const kOtaPrefsKeyVersion = @"its_bundle_version";
static NSString *const kOtaPrefsKeyUpdatedAt = @"its_bundle_updated_at";

@implementation OtaUpdateModule

RCT_EXPORT_MODULE(OtaUpdateModule);

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"OtaDownloadProgress"];
}

- (NSURL *)otaDirectoryURL
{
    NSArray<NSURL *> *urls = [[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask];
    NSURL *docDir = urls.firstObject;
    return [docDir URLByAppendingPathComponent:@"ota" isDirectory:YES];
}

- (NSURL *)otaBundleFileURL
{
    return [[self otaDirectoryURL] URLByAppendingPathComponent:@"main.jsbundle"];
}

RCT_EXPORT_METHOD(getBundleInfo:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSURL *bundleFile = [self otaBundleFileURL];
        BOOL hasOta = [[NSFileManager defaultManager] fileExistsAtPath:[bundleFile path]];
        
        NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
        NSString *version = [prefs stringForKey:kOtaPrefsKeyVersion];
        if (!version || [version length] == 0) {
            version = @"1.0.0-base";
        }
        double lastUpdatedAt = [prefs doubleForKey:kOtaPrefsKeyUpdatedAt];
        
        double size = 0.0;
        if (hasOta) {
            NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:[bundleFile path] error:nil];
            size = (double)[attrs fileSize];
        }
        
        NSDictionary *result = @{
            @"isOtaActive": @(hasOta),
            @"bundleVersion": version,
            @"lastUpdatedAt": @(lastUpdatedAt),
            @"bundleSize": @(size)
        };
        resolve(result);
    } @catch (NSException *exception) {
        reject(@"ERR_OTA_INFO", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(downloadAndApplyBundle:(NSString *)downloadUrl
                  targetVersion:(NSString *)targetVersion
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    self.downloadResolve = resolve;
    self.downloadReject = reject;
    self.targetVersion = targetVersion;
    
    NSURL *url = [NSURL URLWithString:downloadUrl];
    if (!url) {
        reject(@"ERR_INVALID_URL", @"URL không hợp lệ", nil);
        return;
    }
    
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    config.timeoutIntervalForRequest = 30.0;
    config.timeoutIntervalForResource = 60.0;
    
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:[NSOperationQueue mainQueue]];
    NSURLSessionDownloadTask *task = [session downloadTaskWithURL:url];
    [task resume];
}

#pragma mark - NSURLSessionDownloadDelegate

- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
      didWriteData:(int64_t)bytesWritten
 totalBytesWritten:(int64_t)totalBytesWritten
totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite
{
    int64_t total = totalBytesExpectedToWrite;
    if (total <= 0) {
        total = 2500000;
    }
    
    int percent = (int)(((double)totalBytesWritten / (double)total) * 100.0);
    if (percent > 99) {
        percent = 99;
    }
    
    [self sendEventWithName:@"OtaDownloadProgress" body:@{
        @"percent": @(percent),
        @"downloadedBytes": @(totalBytesWritten),
        @"totalBytes": @(total)
    }];
}

- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
didFinishDownloadingToURL:(NSURL *)location
{
    [self sendEventWithName:@"OtaDownloadProgress" body:@{
        @"percent": @(100),
        @"downloadedBytes": @(2500000),
        @"totalBytes": @(2500000)
    }];
    
    NSFileManager *fm = [NSFileManager defaultManager];
    NSURL *otaDir = [self otaDirectoryURL];
    [fm createDirectoryAtURL:otaDir withIntermediateDirectories:YES attributes:nil error:nil];
    
    NSURL *destFile = [self otaBundleFileURL];
    
    NSData *headerData = [NSData dataWithContentsOfURL:location options:NSDataReadingMappedIfSafe error:nil];
    BOOL isZip = NO;
    if (headerData.length >= 4) {
        const unsigned char *bytes = (const unsigned char *)[headerData bytes];
        if (bytes[0] == 0x50 && bytes[1] == 0x4B) {
            isZip = YES;
        }
    }
    
    NSError *error = nil;
    if (isZip) {
        BOOL unzipped = [self unzipArchiveAtURL:location toDirectory:otaDir];
        if (!unzipped) {
            [fm removeItemAtURL:destFile error:nil];
            [fm copyItemAtURL:location toURL:destFile error:&error];
        }
    } else {
        [fm removeItemAtURL:destFile error:nil];
        [fm copyItemAtURL:location toURL:destFile error:&error];
    }
    
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    [prefs setObject:self.targetVersion forKey:kOtaPrefsKeyVersion];
    [prefs setDouble:[[NSDate date] timeIntervalSince1970] * 1000.0 forKey:kOtaPrefsKeyUpdatedAt];
    [prefs synchronize];
    
    if (self.downloadResolve) {
        self.downloadResolve(@{
            @"success": @YES,
            @"version": self.targetVersion ?: @"latest"
        });
        self.downloadResolve = nil;
        self.downloadReject = nil;
    }
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(NSError *)error
{
    if (error && self.downloadReject) {
        self.downloadReject(@"ERR_DOWNLOAD_FAILED", error.localizedDescription, error);
        self.downloadResolve = nil;
        self.downloadReject = nil;
    }
}

- (BOOL)unzipArchiveAtURL:(NSURL *)zipURL toDirectory:(NSURL *)destDir
{
    NSData *data = [NSData dataWithContentsOfURL:zipURL];
    if (!data || data.length < 30) return NO;
    
    const unsigned char *bytes = (const unsigned char *)[data bytes];
    NSUInteger length = [data length];
    NSUInteger offset = 0;
    NSFileManager *fm = [NSFileManager defaultManager];
    
    while (offset + 30 <= length) {
        if (bytes[offset] != 0x50 || bytes[offset+1] != 0x4B ||
            bytes[offset+2] != 0x03 || bytes[offset+3] != 0x04) {
            break;
        }
        
        uint16_t method = bytes[offset+8] | (bytes[offset+9] << 8);
        uint32_t compSize = bytes[offset+18] | (bytes[offset+19] << 8) | (bytes[offset+20] << 16) | (bytes[offset+21] << 24);
        uint32_t uncompSize = bytes[offset+22] | (bytes[offset+23] << 8) | (bytes[offset+24] << 16) | (bytes[offset+25] << 24);
        uint16_t nameLen = bytes[offset+26] | (bytes[offset+27] << 8);
        uint16_t extraLen = bytes[offset+28] | (bytes[offset+29] << 8);
        
        NSUInteger nameOffset = offset + 30;
        NSUInteger dataOffset = nameOffset + nameLen + extraLen;
        
        if (dataOffset + compSize > length) break;
        
        NSString *entryName = [[NSString alloc] initWithBytes:bytes + nameOffset length:nameLen encoding:NSUTF8StringEncoding];
        if (!entryName) {
            entryName = [[NSString alloc] initWithBytes:bytes + nameOffset length:nameLen encoding:NSASCIIStringEncoding];
        }
        
        NSString *destFilename = @"main.jsbundle";
        if ([entryName hasSuffix:@".bundle"] || [entryName hasSuffix:@".jsbundle"] || [entryName containsString:@"bundle"]) {
            destFilename = @"main.jsbundle";
        } else if (entryName.length > 0 && ![entryName hasSuffix:@"/"]) {
            destFilename = [entryName lastPathComponent];
        }
        
        NSURL *targetURL = [destDir URLByAppendingPathComponent:destFilename];
        NSData *extractedData = nil;
        
        if (method == 0) {
            extractedData = [data subdataWithRange:NSMakeRange(dataOffset, compSize)];
        } else if (method == 8) {
            NSMutableData *decompressed = [NSMutableData dataWithLength:uncompSize];
            z_stream strm;
            memset(&strm, 0, sizeof(strm));
            strm.next_in = (Bytef *)(bytes + dataOffset);
            strm.avail_in = (uInt)compSize;
            strm.next_out = (Bytef *)[decompressed mutableBytes];
            strm.avail_out = (uInt)uncompSize;
            
            if (inflateInit2(&strm, -MAX_WBITS) == Z_OK) {
                inflate(&strm, Z_FINISH);
                inflateEnd(&strm);
                extractedData = decompressed;
            }
        }
        
        if (extractedData) {
            [fm removeItemAtURL:targetURL error:nil];
            [extractedData writeToURL:targetURL atomically:YES];
        }
        
        offset = dataOffset + compSize;
    }
    
    return YES;
}

RCT_EXPORT_METHOD(reloadApp:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTTriggerReloadCommandListeners(@"OTA Update Activated");
        resolve(@YES);
    });
}

RCT_EXPORT_METHOD(resetToFactory:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSURL *otaDir = [self otaDirectoryURL];
        [[NSFileManager defaultManager] removeItemAtURL:otaDir error:nil];
        
        NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
        [prefs removeObjectForKey:kOtaPrefsKeyVersion];
        [prefs removeObjectForKey:kOtaPrefsKeyUpdatedAt];
        [prefs synchronize];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            RCTTriggerReloadCommandListeners(@"OTA Reset to Factory");
            resolve(@YES);
        });
    } @catch (NSException *exception) {
        reject(@"ERR_RESET", exception.reason, nil);
    }
}

@end
