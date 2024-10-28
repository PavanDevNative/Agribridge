import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';

const PolygonList = ({ polygons, areas, onClose }) => {
   return (
      <Modal transparent={true} visible={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                  <View style={styles.container}>
                     <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                     </TouchableOpacity>
                     <FlatList
                        data={polygons}
                        keyExtractor={(item, index) => `polygon-card-${index}`}
                        renderItem={({ item, index }) => (
                           <View style={styles.card}>
                              <Text style={styles.cardTitle}>Polygon {index + 1}</Text>
                              <Text style={styles.cardArea}>
                                 Area: {areas[index] ? areas[index].toFixed(2) : 'N/A'} acres
                              </Text>
                           </View>
                        )}
                        contentContainerStyle={styles.scrollViewContent}
                        style={styles.flatList}
                        showsVerticalScrollIndicator={false} 
                        nestedScrollEnabled={true} 
                     />
                  </View>
            </View>
      </Modal>
   );
};

const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
   },
   container: {
      width: '100%',
      maxHeight: '80%', 
      backgroundColor: 'white',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      padding: 5,
      elevation: 5,
   },
   closeButton: {
      backgroundColor: '#f44336',
      padding: 5,
      borderRadius: 5,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center'
   },
   closeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
   },
   flatList: {
      flexGrow: 1, 
   },
   scrollViewContent: {
      paddingBottom: 50, 
   },
   card: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 5,
      marginHorizontal: 8,
      marginBottom: 7,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 5,
   },
   cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
   },
   cardArea: {
      fontSize: 16,
      color: '#555',
   },
});

export default PolygonList;
