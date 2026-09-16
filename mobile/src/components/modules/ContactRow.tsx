import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Contact } from '../../types/contacts';
import { COLORS } from '../../constants/colors';

interface ContactRowProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({ contact, onCall }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            contact.isOnline ? styles.dotOnline : styles.dotOffline,
          ]}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{contact.name}</Text>
        <Text style={styles.deptText}>{contact.department}</Text>
        <View style={styles.extensionBadge}>
          <Text style={styles.extensionText}>Ext: {contact.extension}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        activeOpacity={0.7}
        onPress={() => onCall(contact)}
      >
        <Text style={styles.callIcon}>📞</Text>
        <Text style={styles.callButtonText}>Gọi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  dotOnline: {
    backgroundColor: COLORS.success,
  },
  dotOffline: {
    backgroundColor: COLORS.gray400,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  deptText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  extensionBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  extensionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  callIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
