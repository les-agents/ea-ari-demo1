//ea-ari.js - Script Voiceflow avec paramètre versionID via URL ou localStorage (12h)
//2025-04-01-12:54
console.log("=> ea-ari.js - Voiceflow configurator with dynamic versionID (URL/localStorage) 2025-04-01-12:54");

// Fonction pour vérifier si une valeur dans localStorage est encore valide (moins de 12h)
function isStoredValueValid(timestamp) {
    const currentTime = new Date().getTime();
    const storedTime = parseInt(timestamp, 10);
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    
    return !isNaN(storedTime) && (currentTime - storedTime < twelveHoursInMs);
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
        // Redirect the page to the given URL
        window.location.href = url;
    }
};

(function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
        window.voiceflow.chat.load({
            verify: { projectID: '67c42da6a9ca2ac532c2c721' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: versionID, // Utilise la valeur récupérée du paramètre d'URL
            assistant: { 
                extensions: [CustomOpenURLExtension],
                stylesheet:'https://ea-ari-demo1.vercel.app/voiceflow.fr.css'
             },
            voice: { 
                url: "https://runtime-api.voiceflow.com" 
            }
        });
    };
    v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    v.type = "text/javascript";
    s.parentNode.insertBefore(v, s);
})(document, 'script');