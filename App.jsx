


import React, { useState, useEffect, useRef } from 'react';
import MapboxGL from '@rnmapbox/maps';
import {
   View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform,
   Image
} from 'react-native';
import * as turf from '@turf/turf'; 
import Geolocation from '@react-native-community/geolocation';

MapboxGL.setAccessToken('pk.eyJ1Ijoic2hlZW5hMjAyNCIsImEiOiJjbHljejRucWgwMGxlMnJxd3YxYnR2ZmF5In0.V5xOrFpmmXijq6nc4lKTsw');

export default function App() {
   const [userLocation, setUserLocation] = useState(null);
   const [polygons, setPolygons] = useState([]);
   const [isDrawing, setIsDrawing] = useState(false);
   const [mapPoints, setMapPoints] = useState([]);
   const [camera, setCamera] = useState({
      centerCoordinate: [0, 0],
      zoomLevel: 10,
      animationDuration: 1000,
   });
   const [areas, setAreas] = useState([]); 
   const polygonCoordinatesRef = useRef([]);

   useEffect(() => {
      if (!isDrawing) polygonCoordinatesRef.current = [];
   }, [isDrawing]);

   const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
         const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
               title: 'Location Permission',
               message: 'This app needs access to your location.',
               buttonNeutral: 'Ask Me Later',
               buttonNegative: 'Cancel',
               buttonPositive: 'OK',
            },
         );
         return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
   };

   useEffect(() => {
      const fetchLocation = async () => {
         const hasPermission = await requestLocationPermission();
         if (hasPermission) {
            Geolocation.getCurrentPosition(
               (position) => {
                  const { longitude, latitude } = position.coords;
                  setUserLocation({ longitude, latitude });
                  setCamera((prevCamera) => ({
                     ...prevCamera,
                     centerCoordinate: [longitude, latitude],
                  }));
               },
               (error) => {
                  console.error('Error fetching location:', error);
               },
               { enableHighAccuracy: true, timeout: 90000, maximumAge: 1000 },
            );
         } else {
            alert('Location permission denied.');
         }
      };

      fetchLocation();
   }, []);

   const onMapPress = async (event) => {
      if (!isDrawing) return;
      try {
         const { geometry } = event;
         const newCoordinate = geometry.coordinates;

         polygonCoordinatesRef.current.push(newCoordinate);
         setMapPoints([...mapPoints, newCoordinate]);
      } catch (error) {
         console.error('Error adding point:', error);
      }
   };

   const completePolygon = () => {
      if (polygonCoordinatesRef.current.length < 3) {
         alert("A polygon requires at least three points.");
         return;
      }

      const closedPolygon = [...polygonCoordinatesRef.current, polygonCoordinatesRef.current[0]];
      const polygonFeature = turf.polygon([closedPolygon]);
      const calculatedArea = turf.area(polygonFeature);

      
      setPolygons([...polygons, closedPolygon]);
      if (areas.length < 5) { 
         setAreas((prevAreas) => [...prevAreas, calculatedArea]);
      } else {
         alert("Maximum of 5 polygons reached.");
      }

      setIsDrawing(false);
   };

   const centerMapOnUserLocation = () => {
      if (userLocation) {
         setCamera({
            centerCoordinate: [userLocation.longitude, userLocation.latitude],
            zoomLevel: 10,
            animationDuration: 1000,
         });
      } else {
         alert("User location not available.");
      }
   };

   return (
      <View style={styles.container}>
         <MapboxGL.MapView
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Satellite}
            onPress={onMapPress}
            scrollEnabled={!isDrawing}
            zoomEnabled={!isDrawing}
            onDidFinishLoadingMap={() => console.log('Map Loaded')}
         >
            <MapboxGL.UserLocation
               visible={true}
               onUpdate={(location) => setUserLocation(location.coords)}
            />
            <MapboxGL.Camera
               centerCoordinate={camera.centerCoordinate}
               zoomLevel={camera.zoomLevel}
               animationMode="flyTo"
               animationDuration={camera.animationDuration}
            />

           
            {polygons.map((polygon, index) => (
               <MapboxGL.ShapeSource
                  key={`polygon-${index}`}
                  id={`polygon-${index}`}
                  shape={{
                     type: 'Feature',
                     geometry: {
                        type: 'Polygon',
                        coordinates: [polygon],
                     },
                  }}
               >
                  <MapboxGL.FillLayer id={`fill-layer-${index}`} style={styles.polygon} />
               </MapboxGL.ShapeSource>
            ))}

            
            {mapPoints.map((point, index) => (
               <MapboxGL.PointAnnotation
                  key={`point-${index}`}
                  id={`point-${index}`}
                  coordinate={point}
               >
                  <View style={styles.annotationDot} />
               </MapboxGL.PointAnnotation>
            ))}
         </MapboxGL.MapView>

         
         {areas.map((area, index) => (
            <View
            key={`area-card-${index}`}
            style={[
               styles.areaCard,
               { bottom: 150 + index * 55 },
            ]}
         >
            <Text style={{ color: 'blue' }}>Polygon Area: {area.toFixed(2)} m²</Text>
         </View>
         ))}

         
         <TouchableOpacity style={styles.locateButton} onPress={centerMapOnUserLocation}>
            <Image
               source={require('./assets/locateMe.png')} 
               style={styles.locateImage} 
               resizeMode="contain" 
            />
         </TouchableOpacity>
         <TouchableOpacity style={styles.button} onPress={() => setIsDrawing(!isDrawing)}>
            <Text style={styles.buttonText}>{isDrawing ? 'Finish Polygon' : 'Draw Polygon'}</Text>
         </TouchableOpacity>
         {isDrawing && (
            <TouchableOpacity style={styles.button} onPress={completePolygon}>
               <Text style={styles.buttonText}>Complete Polygon</Text>
            </TouchableOpacity>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1 },
   map: { flex: 1 },
   button: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      zIndex: 10, 
   },
   buttonText: { color: 'white', fontWeight: 'bold' },
   polygon: { fillColor: 'rgba(0, 200, 0, 0.3)' },
   areaCard: {
      position: 'absolute',
      bottom: 160, 
      left: 20,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      marginBottom: 10,
      zIndex: 5, 
   },
   annotationDot: {
      width: 10,
      height: 10,
      backgroundColor: 'red',
      borderRadius: 5,
      borderWidth: 2,
      borderColor: 'white',
   },
   locateButton: {
      position: 'absolute',
      bottom: 80, 
      right: 10,
     backgroundColor: 'transparent',
      padding: 20,
      borderRadius: 15,
      zIndex: 10, 
   },
   locateImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
   },
});


