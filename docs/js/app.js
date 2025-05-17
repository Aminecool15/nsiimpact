document.addEventListener('DOMContentLoaded', function () {
    // Vérifier que Leaflet est bien chargé
    if (typeof L === 'undefined') {
        console.error("Leaflet n'est pas chargé correctement");
        return;
    }

    // Éléments DOM
    const mapElement = document.getElementById('map');
    const aboutButton = document.getElementById('about-button');
    const aboutModal = document.getElementById('about-modal');
    const closeButton = document.querySelector('.close-button');
    const showFatalitiesCheckbox = document.getElementById('show-fatalities');
    const dateSlider = document.getElementById('date-slider');
    const dateRangeDisplay = document.getElementById('date-range-display');

    // État de l'application
    let map;
    let conflictMarkers = [];
    let countriesLayer;
    let showFatalities = true;

    // Limitation pour l'optimisation
    const MAX_VISIBLE_MARKERS = 50; // Limite pour améliorer les performances

    // Obtenir la plage de dates des conflits
    const dateRange = getDateRange(allConflicts);
    let selectedDateRange = {
        from: dateRange.min,
        to: dateRange.max
    };

    // Initialisation de la carte
    function initMap() {
        // Créer la carte avec Leaflet
        map = L.map(mapElement, {
            center: [30, 45], // Centre sur le Moyen-Orient (latitude, longitude)
            zoom: 5, // Zoom plus rapproché sur la région
            minZoom: 2,
            maxZoom: 10, // Limiter le zoom pour de meilleures performances
            zoomControl: false, // On désactive les contrôles par défaut pour les ajouter manuellement
            maxBounds: [[-90, -180], [90, 180]], // Limiter la zone de déplacement
            maxBoundsViscosity: 1.0, // Empêcher de sortir des limites
            preferCanvas: true, // Utiliser Canvas au lieu de SVG pour de meilleures performances
            worldCopyJump: true // Permet un meilleur comportement quand on traverse les bords de la carte
        });

        // Ajouter un fond de carte sombre
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> &mdash; &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            noWrap: true, // Empêcher la répétition infinie de la carte
            bounds: [[-90, -180], [90, 180]]
        }).addTo(map);

        // Ajouter les contrôles de zoom en haut à droite
        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        // Charger et ajouter les frontières des pays avec des options optimisées
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(response => response.json())
            .then(data => {
                // Simplifier les frontières pour améliorer les performances
                countriesLayer = L.geoJSON(data, {
                    style: {
                        weight: 1, // Épaisseur réduite des frontières
                        opacity: 0.3, // Opacité réduite
                        color: '#ffffff',
                        fillColor: '#121820',
                        fillOpacity: 0.1
                    },
                    onEachFeature: onEachCountry,
                    interactive: false // Désactiver l'interactivité pour les pays non survolés
                }).addTo(map);
            })
            .catch(error => console.error("Erreur lors du chargement du fichier GeoJSON:", error));

        // Centrer correctement la carte après chargement
        setTimeout(function() {
            map.invalidateSize();
            map.setView([33, 42], 4); // S'assurer que la carte est bien centrée avec le bon niveau de zoom
        }, 100);

        // Afficher les marqueurs de conflits
        updateMarkers();
    }

    // Fonctions pour la gestion des pays sur la carte
    function onEachCountry(feature, layer) {
        layer.on({
            mouseover: highlightCountry,
            mouseout: resetCountryHighlight,
            click: zoomToCountry
        });
    }

    function highlightCountry(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 2,
            color: '#CC9900',
            fillOpacity: 0.4
        });
    }

    function resetCountryHighlight(e) {
        if (countriesLayer) {
            countriesLayer.resetStyle(e.target);
        }
    }

    function zoomToCountry(e) {
        map.fitBounds(e.target.getBounds());
    }

    // Mettre à jour les marqueurs de conflit sur la carte avec optimisation
    function updateMarkers() {
        // Supprimer les marqueurs existants
        conflictMarkers.forEach(marker => {
            if (map && marker) {
                map.removeLayer(marker);
            }
        });
        conflictMarkers = [];

        // Pas de filtre, on affiche tous les conflits dans la plage de dates
        const filteredConflicts = allConflicts.filter(conflict => {
            const conflictDate = new Date(conflict.date);
            return conflictDate >= selectedDateRange.from && conflictDate <= selectedDateRange.to;
        });

        // Limiter le nombre de marqueurs affichés pour améliorer les performances
        const conflictsToDisplay = filteredConflicts.length > MAX_VISIBLE_MARKERS
            ? filteredConflicts.slice(0, MAX_VISIBLE_MARKERS)
            : filteredConflicts;

        // Ajouter les nouveaux marqueurs
        const markersToAdd = L.layerGroup();
        conflictsToDisplay.forEach(conflict => {
            const marker = createMarker(conflict);
            conflictMarkers.push(marker);
            markersToAdd.addLayer(marker);
        });
        markersToAdd.addTo(map);

        // Avertir l'utilisateur si tous les conflits ne sont pas affichés
        if (filteredConflicts.length > MAX_VISIBLE_MARKERS) {
            console.warn(`Affichage limité à ${MAX_VISIBLE_MARKERS} conflits sur ${filteredConflicts.length} pour optimiser les performances.`);
        }
    }

    // Créer un marqueur pour un conflit avec optimisation
    function createMarker(conflict) {
        // Déterminer la couleur en fonction du type de conflit
        let markerColor;
        switch (conflict.type) {
            case CONFLICT_TYPES.TERRORIST_ORGANIZATION:
                markerColor = '#c10000'; // Jaune foncé
                break;
            case CONFLICT_TYPES.NON_STATE:
                markerColor = '#AA8800'; // Jaune plus foncé
                break;
            case CONFLICT_TYPES.ONE_SIDED:
                markerColor = '#DDAA00'; // Jaune doré
                break;
            default:
                markerColor = '#6c757d'; // Gris
        }

        // Déterminer la taille en fonction du nombre de victimes
        let markerRadius = 7; // Taille par défaut augmentée pour meilleure visibilité
        if (showFatalities) {
            if (conflict.fatalities < 10) markerRadius = 6;
            else if (conflict.fatalities < 50) markerRadius = 8;
            else if (conflict.fatalities < 100) markerRadius = 10;
            else markerRadius = 10; // Tailles augmentées pour meilleure visibilité
        }
        // Créer le marqueur circulaire avec une taille indépendante du zoom (utiliser L.circle au lieu de L.circleMarker)
        // Le rayon est en mètres, donc il reste constant lors du zoom
        const marker = L.circle([conflict.location.latitude, conflict.location.longitude], {
            radius: markerRadius * 20000, // Ajustez le facteur pour obtenir la taille souhaitée
            fillColor: markerColor,
            color: '#000', // Contour noir
            weight: 2, // Épaisseur du contour
            opacity: 1,
            fillOpacity: 0.8,
            bubblingMouseEvents: false
        });

        // Déterminer l'image correspondant au conflit
        let conflictImage = '';
        let detailPageUrl = '#';

        // Assigner les images et les URLs de page détaillée pour les conflits spécifiques
        if (conflict.location.country === "État Islamique") {
            conflictImage = '../../images/pop-up daesh.png'; 
            detailPageUrl = '../../html/DAESH/conflict-daesh-1.html';
        } else if (conflict.location.country === "Israël" || conflict.location.country.includes("Gaza")) {
            conflictImage = 'https://same-assets.com/images/gaza-map.jpg';
            detailPageUrl = 'conflict-israel-hamas.html';
        } else if (conflict.location.country === "Soudan") {
            conflictImage = 'https://same-assets.com/images/sudan-map.jpg';
            detailPageUrl = 'conflict-sudan.html';
        } else if (conflict.location.country === "Syrie" || conflict.location.country === "Irak") {
            conflictImage = '../../images/syria-map.jpg';
            detailPageUrl = 'conflict-daesh.html';
        } else if (conflict.location.country === "Afghanistan") {
            conflictImage = 'https://same-assets.com/images/afghanistan-map.jpg';
            detailPageUrl = 'conflict-afghanistan.html';
        } else if (conflict.location.country === "Yémen") {
            conflictImage = 'https://same-assets.com/images/yemen-map.jpg';
            detailPageUrl = 'conflict-yemen.html';
        }

        // Ajouter une popup avec les informations (création différée pour optimisation)
        marker.on('click', function() {
            // Centrer la carte légèrement au-dessus du marqueur pour que la popup soit bien visible
            const popupOffset = 8; // Ajustez ce facteur si besoin
            const latLng = L.latLng(conflict.location.latitude, conflict.location.longitude);
            const newLat = latLng.lat + popupOffset;
            map.setView([newLat, latLng.lng], 5, { animate: true });

            if (!this.getPopup()) {
                const imageHtml = conflictImage ?
                    `<div class="popup-image" style="height: 120px; background-image: url('${conflictImage}'); background-size: cover; background-position: center; margin-bottom: 10px; border-radius: 4px;"></div>` : '';

                const popupContent = `
                    <div class="popup-content">
                        ${imageHtml}
                        <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: #CC9900; font-weight: bold;">${conflict.location.country}${conflict.location.admin1 ? `, ${conflict.location.admin1}` : ''}</h3>
                        <p><span class="font-medium">Date:</span> ${formatDateForDisplay(new Date(conflict.date))}</p>
                        <p><span class="font-medium">Type:</span> ${translateConflictType(conflict.type)}</p>
                        <p><span class="font-medium">Acteurs:</span> ${conflict.actors.map(actor => actor.name).join(', ')}</p>
                        <p><span class="font-medium">Victimes:</span> ${conflict.fatalities}</p>
                        <p><span class="font-medium">Armes:</span> ${conflict.weaponType}</p>
                        <p>${conflict.description}</p>
                        <a href="${detailPageUrl}" class="detail-button" style="display: block; text-align: center; background-color: #CC9900; color: #fff; padding: 8px; margin-top: 10px; border-radius: 4px; text-decoration: none;">
                            <strong>Analyser ce conflit</strong> <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                `;

                // Créer un style personnalisé pour la popup
                const customOptions = {
                    maxWidth: 300,
                    className: 'custom-popup'
                };

                this.bindPopup(popupContent, customOptions);
                this.openPopup();
            }
        });

        return marker;
    }

    // Traduire les types de conflit pour l'affichage
    function translateConflictType(type) {
        switch(type) {
            case CONFLICT_TYPES.STATE_BASED:
                return "Conflit Étatique";
            case CONFLICT_TYPES.TERRORIST_ORGANIZATION:
                return "Organisation Terroriste";
            case CONFLICT_TYPES.ONE_SIDED:
                return "Violence Unilatérale";
            default:
                return type;
        }
    }

    // Mettre à jour l'affichage de la date
    function updateDateDisplay() {
        if (dateRangeDisplay) {
            const fromYear = selectedDateRange.from.getFullYear();
            const toYear = selectedDateRange.to.getFullYear();
            dateRangeDisplay.textContent = `${fromYear} - ${toYear}`;
        }
    }

    // Initialiser le curseur de date
    function initDateSlider() {
        if (!dateSlider) return;

        // Configurer l'événement du slider
        dateSlider.min = 2020;
        dateSlider.max = 2025;
        dateSlider.value = 2025;

        // Mettre à jour l'affichage et les marqueurs
        selectedDateRange = {
            from: new Date(2020, 0, 1),
            to: new Date(2025, 11, 31)
        };

        updateDateDisplay();

        // Événement de changement d'année avec debounce pour l'optimisation
        let timeout = null;
        dateSlider.addEventListener('input', function(e) {
            const year = parseInt(e.target.value);

            // Mettre à jour l'affichage immédiatement
            selectedDateRange = {
                from: new Date(2020, 0, 1),
                to: new Date(year, 11, 31)
            };
            updateDateDisplay();

            // Débouncer la mise à jour des marqueurs pour éviter les lags
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                updateMarkers();
            }, 300);
        });
    }

    // === Gestionnaires d'événements ===

    // Afficher/masquer la fenêtre modale "À propos"
    aboutButton.addEventListener('click', function() {
        aboutModal.style.display = 'block';
    });

    // Fermer la fenêtre modale
    closeButton.addEventListener('click', function() {
        aboutModal.style.display = 'none';
    });

    // Fermer la fenêtre modale en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // Activer/désactiver l'échelle des marqueurs par nombre de victimes
    showFatalitiesCheckbox.addEventListener('change', function() {
        showFatalities = this.checked;
        updateMarkers();
    });

    // Optimisation du redimensionnement de la fenêtre
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            map.invalidateSize();
        }, 250);
    });

    // Initialiser l'application
    initMap();
    initDateSlider();
});
