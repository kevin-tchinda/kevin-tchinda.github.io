let map;
let infoWindow;
let zones = [];           // store zones for later intersection checks
let routePolyline = null; // current route polyline
let directionsService;
let directionsRenderer;
let autocompleteSource, autocompleteDest;

// Risk level colors
const riskColors = {
    "critique": "#ffeb3b",
    "high": "#d32f2f",
    "moderate": "#f57c00",
    "low": "#388e3c"
};

// Marker icons
const markerIcons = {
    injury: {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23d32f2f'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E",
        scaledSize: new google.maps.Size(24, 24)
    },
    material: {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23ffb74d'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E",
        scaledSize: new google.maps.Size(24, 24)
    }
};

function initMap() {
    const ottawa = { lat: 45.4215, lng: -75.6972 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: ottawa,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#373f4b" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
        ],
    });
    infoWindow = new google.maps.InfoWindow();

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map, suppressMarkers: true });

    // Autocomplete
    const sourceInput = document.getElementById('source');
    const destInput = document.getElementById('destination');
    autocompleteSource = new google.maps.places.Autocomplete(sourceInput);
    autocompleteDest = new google.maps.places.Autocomplete(destInput);
    autocompleteSource.bindTo('bounds', map);
    autocompleteDest.bindTo('bounds', map);

    // Load JSON data
    fetch('total_risk_zones.json')
        .then(response => response.json())
        .then(data => {
            zones = data.zones;
            // Draw circles
            zones.forEach(zone => drawCircle(zone));
            // Add heatmap
            const heatmapPoints = data.heatmap_points.map(point => ({
                location: new google.maps.LatLng(point.lat, point.lng),
                weight: point.weight
            }));
            addHeatmap(heatmapPoints);
            // Add markers
            data.clickable_points.forEach(point => addMarker(point));
        })
        .catch(error => console.error('Error loading JSON:', error));

    // Route button
    document.getElementById('getRoute').addEventListener('click', calculateRoute);
}

function drawCircle(zone) {
    const center = { lat: zone.lat, lng: zone.lng };
    const color = riskColors[zone.riskLevel] || "#aaaaaa";
    const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        center: center,
        radius: zone.radius,
        clickable: true,
    });
    const content = `
        <div style="font-family: 'Inter', sans-serif; max-width: 250px; color: #3C3431;">
            <strong>${zone.name}</strong><br>
            <strong>Cluster ID:</strong> ${zone.cluster_id}<br>
            <strong>Accidents:</strong> ${zone.severity}<br>
            <strong>Injury rate:</strong> ${zone.injury_rate}%<br>
            <strong>Risk level:</strong> ${zone.riskLevel}
        </div>
    `;
    circle.addListener('click', (event) => {
        infoWindow.setContent(content);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
    });
}

function addHeatmap(points) {
    const heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        radius: 25,
        opacity: 0.6,
        map: map
    });
}

function addMarker(point) {
    const iconType = point.severity_type === "injury" ? "injury" : "material";
    const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map,
        icon: markerIcons[iconType],
        title: `Accident ${point.severity_type}`
    });
    const content = `
        <div style="font-family: 'Inter', sans-serif; color: #3C3431;">
            <strong>Type:</strong> ${point.severity_type}<br>
            <strong>Classification:</strong> ${point.classification}<br>
            <strong>Impact:</strong> ${point.impact_type}<br>
            <strong>Cluster ID:</strong> ${point.cluster_id}
        </div>
    `;
    marker.addListener('click', () => {
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });
}

function calculateRoute() {
    const source = document.getElementById('source').value;
    const dest = document.getElementById('destination').value;
    if (!source || !dest) {
        alert("Please enter both a start and destination address.");
        return;
    }
    const request = {
        origin: source,
        destination: dest,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
    };
    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            if (routePolyline) routePolyline.setMap(null);
            directionsRenderer.setDirections(result);
            // After drawing route, check intersections with zones
            const routePath = result.routes[0].overview_path; // array of LatLng
            const intersectingZones = findIntersectingZones(routePath);
            displayWarning(intersectingZones);
        } else {
            alert("Could not find a route: " + status);
        }
    });
}

function findIntersectingZones(routePath) {
    const intersecting = [];
    for (let zone of zones) {
        const center = new google.maps.LatLng(zone.lat, zone.lng);
        const radius = zone.radius;
        let intersects = false;
        for (let point of routePath) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(point, center);
            if (distance <= radius) {
                intersects = true;
                break;
            }
        }
        if (intersects) {
            intersecting.push(zone);
        }
    }
    return intersecting;
}

function displayWarning(zones) {
    const warningDiv = document.getElementById('routeWarning');
    if (zones.length === 0) {
        warningDiv.innerHTML = "No risk zones detected on this route.";
        return;
    }
    let text = `<strong>Risk zones on this route (Be cautious !):</strong> `;
    text += zones.map(z => `${z.name} (${z.riskLevel})`).join(", ");
    warningDiv.innerHTML = text;
}