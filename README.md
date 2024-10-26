# React Native Mapbox Polygon Drawer

This React Native application allows users to interact with a map using Mapbox GL. Users can draw polygons, calculate their areas, and visualize their current location. The app utilizes geolocation services to center the map on the user's position and supports drawing multiple polygons.

## Features

- **Real-Time Location Tracking**: Automatically centers the map based on the user's current location.
- **Polygon Drawing**: Users can draw custom polygons on the map.
- **Area Calculation**: Automatically calculates and displays the area of the drawn polygons.
- **Intuitive UI**: Simple buttons to draw polygons, complete shapes, and locate the user.

## Prerequisites

Before you begin, ensure you have the following installed:


- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Mapbox account](https://www.mapbox.com/)
- [Android Studio](https://developer.android.com/studio) 

## Getting Started

 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/PavanDevNative/Agribridge.git


2.Navigate to the Project Directory:

cd Agribridge

3. Install Dependencies

npm install

4. Set Up Mapbox
        Sign up for a Mapbox account and create a new access token.
        Replace the access token in App.js:

        MapboxGL.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN');
5. Configure Android Permissions

    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

6. run your application

    npx react-native run-android


Usage
1.Launching the App: Open the app on your device or emulator.
2.User Location: The map will automatically center on your current location.
3.Drawing Polygons: Tap on the map to create points for your polygon. Ensure at least three points are created to form a valid polygon.
4.Completing the Polygon: After adding points, tap the "Complete Polygon" button to finish the shape and calculate the area.
5.Viewing Area: The area of the polygon will be displayed on the screen.