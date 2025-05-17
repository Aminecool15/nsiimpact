// Types de conflits
const CONFLICT_TYPES = {
    STATE_BASED: "State-based",
    TERRORIST_ORGANIZATION: "Organisation terroriste",
};

// Régions
const REGIONS = {
    AFRICA: "Afrique",
    AMERICAS: "Amériques",
    ASIA: "Asie",
    EUROPE: "Europe",
    MIDDLE_EAST: "Moyen-Orient"
};

// Types d'acteurs
const ACTOR_TYPES = {
    GOVERNMENT: "Gouvernement",
    REBEL_GROUP: "Groupe rebelle",
    MILITIA: "Milice",
    TERRORIST_ORGANIZATION: "Organisation terroriste",
    IDENTITY_GROUP: "Groupe identitaire"
};

// Types d'armes
const WEAPON_TYPES = {
    SMALL_ARMS: "Armes légères",
    HEAVY_WEAPONS: "Armes lourdes",
    EXPLOSIVES: "Explosifs",
    AIR_STRIKES: "Frappes aériennes",
    CHEMICAL_WEAPONS: "Armes chimiques"
};

// Fonction pour générer ID aléatoire
const generateId = () => Math.random().toString(36).substring(2, 10);

// Fonction pour générer un nombre aléatoire dans une plage
const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fonction pour formater une date
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

// Conflits d'exemple spécifiques (bien documentés)
const sampleConflicts = [
{
    id: generateId(),
    date: "2014-06-29",
    location: {
        country: "État Islamique",
        admin1: "",
        latitude: 34.438825,
        longitude: 40.970987,
    },
    actors: [
        { name: "État islamique (Daesh)", type: ACTOR_TYPES.TERRORIST_ORGANIZATION },
        { name: "Forces armées irakiennes", type: ACTOR_TYPES.GOVERNMENT },
        { name: "Coalition Internationale", type: ACTOR_TYPES.GOVERNMENT }
    ],
    type: CONFLICT_TYPES.TERRORIST_ORGANIZATION,
    description: "Proclamation du califat par Abou Mohammed al-Adnani, marquant le début de son expansion territoriale",
    fatalities: 150000,
    weaponType: WEAPON_TYPES.HEAVY_WEAPONS,
    region: REGIONS.MIDDLE_EAST,
    source: "ACLED",
}
];



// Combiner les conflits spécifiques et aléatoires
const allConflicts = [...sampleConflicts];

// Fonction pour obtenir les dates min et max des conflits
const getDateRange = (conflicts) => {
    const dates = conflicts.map(c => new Date(c.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return { min: minDate, max: maxDate };
};

// Formater une date pour l'affichage
const formatDateForDisplay = (date) => {
    return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

// Filtrer les conflits en fonction des critères
const filterConflicts = (conflicts, selectedRegions, selectedTypes, dateRange) => {
    return conflicts.filter(conflict => {
        const conflictDate = new Date(conflict.date);

        const matchesRegion = selectedRegions.length === 0 ||
            selectedRegions.includes(conflict.region);

        const matchesType = selectedTypes.length === 0 ||
            selectedTypes.includes(conflict.type);

        // S'assurer que dateRange.from et dateRange.to sont bien des objets Date
        const fromDate = dateRange.from instanceof Date ? dateRange.from : new Date(dateRange.from);
        const toDate = dateRange.to instanceof Date ? dateRange.to : new Date(dateRange.to);

        const matchesDate =
            conflictDate >= fromDate &&
            conflictDate <= toDate;

        return matchesRegion && matchesType && matchesDate;
    });
};

// Calculer les statistiques sur les conflits
const calculateStatistics = (conflicts) => {
    // Total des victimes
    const totalFatalities = conflicts.reduce((total, conflict) => total + conflict.fatalities, 0);

    // Victimes par région
    const fatalitiesByRegion = {};
    conflicts.forEach(conflict => {
        if (!fatalitiesByRegion[conflict.region]) {
            fatalitiesByRegion[conflict.region] = 0;
        }
        fatalitiesByRegion[conflict.region] += conflict.fatalities;
    });

    // Victimes par type de conflit
    const fatalitiesByType = {};
    conflicts.forEach(conflict => {
        if (!fatalitiesByType[conflict.type]) {
            fatalitiesByType[conflict.type] = 0;
        }
        fatalitiesByType[conflict.type] += conflict.fatalities;
    });

    return {
        totalConflicts: conflicts.length,
        totalFatalities,
        averageFatalities: conflicts.length > 0 ? Math.round(totalFatalities / conflicts.length) : 0,
        fatalitiesByRegion,
        fatalitiesByType
    };
};

const filtered = filterConflicts(
    allConflicts,
    selectedRegions, // tableau des régions sélectionnées
    selectedTypes,   // tableau des types sélectionnés
    dateRange        // { from: Date, to: Date }
);
document.getElementById("toggle-filters").addEventListener("click", applyFilters);

function applyFilters() {
    // 1. Récupérer les régions cochées
    const selectedRegions = Array.from(document.querySelectorAll(".region-checkbox:checked"))
        .map(cb => cb.dataset.region);

    // 2. Récupérer les types cochés
    const selectedTypes = Array.from(document.querySelectorAll(".type-checkbox:checked"))
        .map(cb => cb.dataset.type);

    // 3. Récupérer la date à partir du slider
    const selectedYear = document.getElementById("date-slider").value;
    const dateRange = {
        from: new Date(`${selectedYear}-01-01`),
        to: new Date(`${selectedYear}-12-31`)
    };

    // 4. Filtrer les conflits
    const filtered = filterConflicts(allConflicts, selectedRegions, selectedTypes, dateRange);

    // 5. (exemple) Affichage console
    console.log("Conflits filtrés :", filtered);

    // Tu peux maintenant appeler ta fonction d'affichage sur la carte ici
    // displayConflictsOnMap(filtered);
}

function displayConflictsOnMap(conflicts) {
    const mapContainer = document.getElementById("map"); // ou ton conteneur réel
    mapContainer.innerHTML = ""; // Nettoyer

    conflicts.forEach(conflict => {
        // Créer un élément pour le cercle rouge
        const circle = document.createElement("div");
        circle.className = "conflict-circle";
        circle.style.background = "red";
        circle.style.borderRadius = "50%";
        circle.style.width = "40px";
        circle.style.height = "40px";
        circle.style.display = "flex";
        circle.style.alignItems = "center";
        circle.style.justifyContent = "center";
        circle.style.position = "absolute";
        // Positionne le cercle selon latitude/longitude (à adapter)
        // Exemple simple : convertir latitude/longitude en position (à adapter selon ta carte)
        if (conflict.location && typeof conflict.location.latitude === "number" && typeof conflict.location.longitude === "number") {
            // Ces valeurs sont à adapter selon la taille de ta carte et son système de coordonnées
            const left = (conflict.location.longitude + 180) * 2; // exemple de conversion
            const top = (90 - conflict.location.latitude) * 2;    // exemple de conversion
            circle.style.left = `${left}px`;
            circle.style.top = `${top}px`;
        }

        // Ajouter l'icône Font Awesome
        const icon = document.createElement("i");
        icon.className = "fas fa-bomb";
        icon.style.color = "white";
        icon.style.fontSize = "20px";
        circle.appendChild(icon);

        mapContainer.appendChild(circle);
    });
}
