//ea-ari.js - Script Voiceflow avec paramètre versionID via URL ou localStorage (12h)
//2025-04-01-12:54 - Modifié pour gestion ARIreference
console.log("=> ea-ari.js - Voiceflow configurator with dynamic versionID (URL/localStorage) 2025-04-01-12:54");

// Fonction pour vérifier si une valeur dans localStorage est encore valide (moins de 12h)
function isStoredValueValid(timestamp) {
    const currentTime = new Date().getTime();
    const storedTime = parseInt(timestamp, 10);
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    
    return !isNaN(storedTime) && (currentTime - storedTime < twelveHoursInMs);
}

// Fonction pour extraire la référence de la page
function extractReference() {
    if (typeof window.dataLayer !== 'undefined' && window.dataLayer.length > 0) {
        for (let i = 0; i < window.dataLayer.length; i++) {
            if (window.dataLayer[i].reference) {
                return window.dataLayer[i].reference;
            }
        }
    }
    return null;
}

// Récupération du paramètre ARIversionID depuis l'URL ou localStorage
const urlParams = new URLSearchParams(window.location.search);
const versionIDParam = urlParams.get('ARIversionID');

// Gestion du localStorage avec expiration de 12h
let versionID = 'production';

if (versionIDParam) {
    // Si un paramètre est fourni dans l'URL, on l'utilise et on le stocke
    versionID = versionIDParam;
    localStorage.setItem('ARIversionID', versionID);
    localStorage.setItem('ARIversionID_timestamp', new Date().getTime().toString());
    console.log(`Using Voiceflow versionID from URL: ${versionID}`);
} else {
    // Sinon, on cherche dans le localStorage
    const storedVersionID = localStorage.getItem('ARIversionID');
    const timestamp = localStorage.getItem('ARIversionID_timestamp');
    
    if (storedVersionID && isStoredValueValid(timestamp)) {
        // Si une valeur valide existe dans le localStorage, on l'utilise
        versionID = storedVersionID;
        console.log(`Using Voiceflow versionID from localStorage: ${versionID}`);
    } else {
        // Sinon, on utilise la valeur par défaut
        console.log(`Using default Voiceflow versionID: ${versionID}`);
        // On nettoie le localStorage si la valeur a expiré
        if (storedVersionID) {
            localStorage.removeItem('ARIversionID');
            localStorage.removeItem('ARIversionID_timestamp');
        }
    }
}

const CustomOpenURLExtension = {
    name: "CustomOpenURLExtension",
    type: "effect",

    match: ({ trace }) => {
        return trace.type === "CustomOpenURLExtension";
    },

    effect: ({ trace }) => {
        console.log("CustomOpenURLExtension effect");
        // Ensure the payload contains a valid URL
        if (!trace.payload || !trace.payload.url) {
            console.warn("No URL found in trace payload.");
            return;
        }

        const url = trace.payload.url.trim();

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            console.warn("Invalid URL:", url);
            return;
        }
        
        // Récupérer ARIreference du payload s'il existe
        if (trace.payload.ARIreference) {
            const ariReference = trace.payload.ARIreference;
            console.log(`Storing ARIreference from payload: ${ariReference}`);
            localStorage.setItem('ARIreference', ariReference);
            localStorage.setItem('ARIreference_timestamp', new Date().getTime().toString());
        }
        
        // Redirect the page to the given URL
        window.location.href = url;
    }
};

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Extraire la référence de la page
    const pageReference = extractReference();
    console.log('Référence trouvée sur la page:', pageReference);
    
    // Récupérer la référence stockée
    const storedReference = localStorage.getItem('ARIreference');
    const referenceTimestamp = localStorage.getItem('ARIreference_timestamp');
    
    console.log('Référence stockée:', storedReference);
    
    let shouldOpenChatAutomatically = false;
    
    // Vérifier si les références correspondent
    if (pageReference && storedReference && isStoredValueValid(referenceTimestamp) && pageReference === storedReference) {
        console.log('Les références correspondent, le widget s'ouvrira automatiquement');
        shouldOpenChatAutomatically = true;
    }
    
    // Chargement du widget Voiceflow
    (function(d, t) {
        var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
        v.onload = function() {
            const voiceflowConfig = {
                verify: { projectID: '67c42da6a9ca2ac532c2c721' },
                url: 'https://general-runtime.voiceflow.com',
                versionID: versionID,
                assistant: { 
                    extensions: [CustomOpenURLExtension],
                    stylesheet:'https://ea-ari-demo1.vercel.app/voiceflow.fr.css'
                },
                voice: { 
                    url: "https://runtime-api.voiceflow.com" 
                }
            };
            
            // Charger le widget
            window.voiceflow.chat.load(voiceflowConfig).then(() => {
                if (shouldOpenChatAutomatically) {
                    // Ouvrir automatiquement le widget après 5 secondes si les références correspondent
                    setTimeout(() => {
                        console.log('Ouverture automatique du widget Voiceflow');
                        window.voiceflow.chat.open();
                    }, 5000);
                }
            }).catch(err => {
                console.error('Erreur lors du chargement du widget Voiceflow:', err);
            });
        };
        v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
        v.type = "text/javascript";
        s.parentNode.insertBefore(v, s);
    })(document, 'script');
});