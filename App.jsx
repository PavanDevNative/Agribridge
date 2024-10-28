import React, { useState, useEffect, useRef } from 'react';
import MapboxGL from '@rnmapbox/maps';
import {
   View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform,
   Image,
   ScrollView,
   Modal
} from 'react-native';
import * as turf from '@turf/turf'; 
import Geolocation from '@react-native-community/geolocation';
import PolygonList from './src/PolygonList';


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
   const [locationLoaded, setLocationLoaded] = useState(false);
   const [showPolygonList, setShowPolygonList] = useState(false);

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
                  setLocationLoaded(true); 
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
      const calculatedAreaM2 = turf.area(polygonFeature); 
      const calculatedAreaAcres = calculatedAreaM2 / 4046.86; 
   
      setPolygons([...polygons, closedPolygon]);
      if (areas?.length < 15) { 
         setAreas((prevAreas) => [...prevAreas, calculatedAreaAcres]); 
      } else {
         alert("Maximum of 15 polygons reached.");
      }
   
      setIsDrawing(false);
      setMapPoints([]);
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

   const handleClosePolygonList = () => {
      setShowPolygonList(false); 
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
            {locationLoaded && (
               <MapboxGL.UserLocation
                  visible={true}
                  onUpdate={(location) => {
                     setUserLocation(location.coords);
                     if (!locationLoaded) {
                        setCamera({
                           centerCoordinate: [location.coords.longitude, location.coords.latitude],
                           zoomLevel: 10,
                           animationDuration: 1000,
                        });
                        setLocationLoaded(true);
                     }
                  }}
               />
            )}

            <MapboxGL.Camera
               centerCoordinate={camera.centerCoordinate}
               zoomLevel={camera.zoomLevel}
               animationMode="flyTo"
               animationDuration={camera.animationDuration}
            />

            {isDrawing && mapPoints?.length > 1 && (
               <MapboxGL.ShapeSource
                  id="line-source"
                  shape={{
                     type: 'Feature',
                     geometry: {
                        type: 'LineString',
                        coordinates: mapPoints,
                     },
                  }}
               >
                  <MapboxGL.LineLayer id="line-layer" style={styles.line} />
               </MapboxGL.ShapeSource>
            )}

            {isDrawing && mapPoints?.length >= 3 && (
               <MapboxGL.ShapeSource
                  id="closing-line-source"
                  shape={{
                     type: 'Feature',
                     geometry: {
                        type: 'LineString',
                        coordinates: [mapPoints[mapPoints?.length - 1], mapPoints[0]],
                     },
                  }}
               >
                  <MapboxGL.LineLayer id="closing-line-layer" style={styles.closingLine} />
               </MapboxGL.ShapeSource>
            )}

            {polygons?.map((polygon, index) => (
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

            {mapPoints?.map((point, index) => (
               <MapboxGL.PointAnnotation
                  key={`point-${index}`}
                  id={`point-${index}`}
                  coordinate={point}
               >
                  <View style={styles.annotationDot} />
               </MapboxGL.PointAnnotation>
            ))}
         </MapboxGL.MapView>

         <TouchableOpacity style={styles.listButton} onPress={() => setShowPolygonList(!showPolygonList)}>
            <Text style={styles.buttonText}>{showPolygonList ? 'Hide Polygon List' : 'Show Polygon List'}</Text>
         </TouchableOpacity>

         {showPolygonList && (
            <PolygonList polygons={polygons} areas={areas} onClose={handleClosePolygonList} />
         )}


         {areas?.length > 0 && (
            <View style={styles.areaCard}>
               <Text style={{ color: 'blue' }}>
                  Polygon Area: {areas[areas?.length - 1].toFixed(2)} acres
               </Text>
            </View>
         )}



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
   map: { flex: 1,  },
   button: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      zIndex: 1,
   },
   buttonText: { color: 'white', fontWeight: 'bold' },
   polygon: { fillColor: 'rgba(0, 200, 0, 0.3)' },
   line: { lineColor: '#a2fab1', lineWidth: 3 },
   closingLine: { lineColor: '#fa7646', lineWidth: 2 },
   areaCard: {
      position: 'absolute',
      bottom: 160, 
      left: 20, 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      padding: 10,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      borderRadius: 5,
      elevation: 3, 
      zIndex: 1,
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
      zIndex: 1,
   },
   locateImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
   },
   listButton:{
      position: 'absolute',
      bottom: 50,
      left: 20,
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      zIndex: 1, 
   },
 
});
