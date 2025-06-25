//ea-ari.js - Script Voiceflow avec paramètre versionID via URL ou localStorage (12h)
//2025-06-10 - Version avec debug complet
console.log("🚀 => ea-ari.js - DEBUT DU SCRIPT - Voiceflow configurator with dynamic versionID (URL/localStorage)");

// Fonction pour vérifier si une valeur dans localStorage est encore valide (moins de 7 x 24h)
function isStoredValueValid(timestamp) {
    const currentTime = new Date().getTime();
    const storedTime = parseInt(timestamp, 10);
    const twelveHoursInMs = 7 * 24 * 60 * 60 * 1000;
    
    const isValid = !isNaN(storedTime) && (currentTime - storedTime < twelveHoursInMs);
    console.log(`📅 Validation timestamp: ${timestamp} -> ${isValid ? 'VALIDE' : 'EXPIRE'}`);
    
    return isValid;
}

// Fonction pour extraire la référence de la page
function extractReference() {
    console.log("🔍 Extraction de la référence de la page...");
    console.log("🔍 window.dataLayer exists:", typeof window.dataLayer !== 'undefined');
    console.log("🔍 window.dataLayer:", window.dataLayer);
    
    if (typeof window.dataLayer !== 'undefined' && window.dataLayer.length > 0) {
        console.log(`🔍 dataLayer contient ${window.dataLayer.length} éléments`);
        for (let i = 0; i < window.dataLayer.length; i++) {
            console.log(`🔍 dataLayer[${i}]:`, window.dataLayer[i]);
            if (window.dataLayer[i].reference) {
                console.log(`✅ Référence trouvée dans dataLayer[${i}]: ${window.dataLayer[i].reference}`);
                return window.dataLayer[i].reference;
            }
        }
        console.log("❌ Aucune référence trouvée dans dataLayer");
    } else {
        console.log("❌ dataLayer non disponible ou vide");
    }
    
    // Essayer depuis l'URL comme fallback
    const urlParams = new URLSearchParams(window.location.search);
    const urlReference = urlParams.get('reference');
    if (urlReference) {
        console.log(`✅ Référence trouvée dans URL: ${urlReference}`);
        return urlReference;
    }
    
    console.log("❌ Aucune référence trouvée nulle part");
    return null;
}

// Récupération du paramètre ARIversionID depuis l'URL ou localStorage
console.log("📋 Récupération du versionID...");
const urlParams = new URLSearchParams(window.location.search);
const versionIDParam = urlParams.get('ARIversionID');
console.log("📋 versionID depuis URL:", versionIDParam);

// Gestion du localStorage avec expiration de 12h
let versionID = 'production';

if (versionIDParam) {
    // Si un paramètre est fourni dans l'URL, on l'utilise et on le stocke
    versionID = versionIDParam;
    localStorage.setItem('ARIversionID', versionID);
    localStorage.setItem('ARIversionID_timestamp', new Date().getTime().toString());
    console.log(`✅ Using Voiceflow versionID from URL: ${versionID}`);
} else {
    // Sinon, on cherche dans le localStorage
    const storedVersionID = localStorage.getItem('ARIversionID');
    const timestamp = localStorage.getItem('ARIversionID_timestamp');
    console.log("📋 versionID stocké:", storedVersionID);
    console.log("📋 timestamp stocké:", timestamp);
    
    if (storedVersionID && isStoredValueValid(timestamp)) {
        // Si une valeur valide existe dans le localStorage, on l'utilise
        versionID = storedVersionID;
        console.log(`✅ Using Voiceflow versionID from localStorage: ${versionID}`);
    } else {
        // Sinon, on utilise la valeur par défaut
        console.log(`✅ Using default Voiceflow versionID: ${versionID}`);
        // On nettoie le localStorage si la valeur a expiré
        if (storedVersionID) {
            console.log("🧹 Nettoyage du localStorage (valeur expirée)");
            localStorage.removeItem('ARIversionID');
            localStorage.removeItem('ARIversionID_timestamp');
        }
    }
}

const CustomOpenURLExtension = {
    name: "CustomOpenURLExtension",
    type: "effect",

    match: ({ trace }) => {
        console.log("🔗 CustomOpenURLExtension match check:", trace.type === "CustomOpenURLExtension");
        return trace.type === "CustomOpenURLExtension";
    },

    effect: ({ trace }) => {
        console.log("🔗 CustomOpenURLExtension effect déclenchée");
        console.log("🔗 trace.payload:", trace.payload);
        
        // Ensure the payload contains a valid URL
        if (!trace.payload || !trace.payload.url) {
            console.warn("⚠️ No URL found in trace payload.");
            return;
        }

        const url = trace.payload.url.trim();
        console.log("🔗 URL à ouvrir:", url);

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            console.warn("⚠️ Invalid URL:", url);
            return;
        }
        
        // Récupérer ARIreference du payload s'il existe
        if (trace.payload.ARIreference) {
            const ariReference = trace.payload.ARIreference;
            console.log(`💾 Storing ARIreference from payload: ${ariReference}`);
            localStorage.setItem('ARIreference', ariReference);
            localStorage.setItem('ARIreference_timestamp', new Date().getTime().toString());
        }
        
        // Redirect the page to the given URL
        setTimeout(() => {
            localStorage.setItem('ARIresume', true);
            console.log("🚀 Ouverture automatique de l'annonce : "+ url);
            window.location.href = url;
        }, 3000);
       
    }
};

const uiDefault = {
    primaryButtonColor: '#2e7ff1',
    primaryButtonColorHover: '#0c74e4',
    primaryButtonTextLabel: 'Confirm',
    primaryButtonTextColor: '#ffffff',
    destructiveButtonColor: '#db1b42',
    destructiveButtonColorHover: '#cd0038',
    destructiveButtonTextLabel: 'Cancel',
    destructiveButtonTextColor: '#ffffff',
};
  
const process = (trace) => {
    console.log("🎨 Processing UI options...");
    let { ui = {} } = trace.payload;
    console.log("🎨 UI from payload:", ui);
  
    // merge ui options objects
    ui = Object.assign(uiDefault, ui);
    console.log("🎨 UI final:", ui);
  
    return { ui };
};
  
// Fonctions pour gérer le localStorage du formulaire
function saveFormData(formData) {
    const dataToSave = {
        ...formData,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('ARIformData', JSON.stringify(dataToSave));
    console.log("💾 Données du formulaire sauvegardées:", dataToSave);
}

function loadFormData() {
    const saved = localStorage.getItem('ARIformData');
    if (!saved) {
        console.log("📋 Aucune donnée de formulaire sauvegardée");
        return null;
    }
    
    try {
        const data = JSON.parse(saved);
        // Vérifier si les données ne sont pas trop anciennes (24h)
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - data.timestamp > twentyFourHoursInMs) {
            console.log("📋 Données du formulaire expirées, suppression");
            localStorage.removeItem('ARIformData');
            return null;
        }
        console.log("📋 Données du formulaire chargées:", data);
        return data;
    } catch (error) {
        console.error("❌ Erreur lors du chargement des données du formulaire:", error);
        localStorage.removeItem('ARIformData');
        return null;
    }
}

function clearFormData() {
    localStorage.removeItem('ARIformData');
    console.log("🧹 Données du formulaire supprimées");
}

// Fonctions pour la validation et le formatage du téléphone
function cleanPhoneNumber(phone) {
    // Supprimer tous les caractères non numériques sauf le +
    return phone.replace(/[^\d+]/g, '');
}

function formatFrenchPhone(phone) {
    // Format français : 06 74 95 03 85
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.length === 10 && (cleaned.startsWith('0'))) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return null;
}

function formatInternationalPhone(phone) {
    // Format international : +33 6 74 95 03 85
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+33') && cleaned.length === 12) {
        const withoutCountry = cleaned.substring(3);
        return '+33 ' + withoutCountry.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return null;
}

function validateAndFormatPhone(phone) {
    if (!phone || phone.trim() === '') {
        return { isValid: true, formatted: '', isEmpty: true };
    }
    
    const trimmed = phone.trim();
    console.log("📞 Validation téléphone:", trimmed);
    
    // Essayer le format français
    const frenchFormatted = formatFrenchPhone(trimmed);
    if (frenchFormatted) {
        console.log("📞 Format français détecté:", frenchFormatted);
        return { isValid: true, formatted: frenchFormatted, isEmpty: false };
    }
    
    // Essayer le format international
    const internationalFormatted = formatInternationalPhone(trimmed);
    if (internationalFormatted) {
        console.log("📞 Format international détecté:", internationalFormatted);
        return { isValid: true, formatted: internationalFormatted, isEmpty: false };
    }
    
    console.log("📞 Format invalide détecté");
    return { isValid: false, formatted: trimmed, isEmpty: false };
}

const LeadFormExtension = {
    name: 'FormLeadData',
    type: 'response',
    match: ({ trace }) => {
        const isMatch = trace.type === 'ext_lead_form' || trace.payload?.name === 'ext_lead_form';
        console.log("📋 LeadFormExtension match check:", isMatch);
        console.log("📋 trace.type:", trace.type);
        console.log("📋 trace.payload?.name:", trace.payload?.name);
        return isMatch;
    },
    render: ({ trace, element }) => {
        console.log("📋 === DEBUT RENDER LEAD FORM ===");
        console.log("📋 Full trace:", trace);
        console.log("📋 Full payload:", trace.payload);
        
        let payload = trace.payload;
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                console.error('❌ Failed to parse extension payload:', e);
                return;
            }
        }
        const { api, data } = payload || {};
        if (!api || !api.endpoint || !api.key) {
            console.error('❌ Missing API configuration:', payload);
            return;
        }
        console.log("📋 API config:", api);
        console.log("📋 Data config:", data);
        
        const { ui } = process(trace);
        console.log("📋 UI config final:", ui);

        // Charger les données sauvegardées
        const savedData = loadFormData();

        const formContainer = document.createElement('form');

        formContainer.innerHTML = `
            <style>
              .container {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                gap: 14px;
                margin: 0;
                padding: 0;
                width: 225px;
                max-width: none;
                overflow: visible;
                overflowX: hidden;
                overflowY: hidden;
              }
              .fieldset {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                margin: 0;
                padding: 0;
                width: 100%;
                max-width: none;
                overflow: visible;
                overflowX: hidden;
              }
              label {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 0.8em;
                color: #888;
              }
              input[type="text"], input[type="email"], input[type="tel"], select {
                box-sizing: border-box;
                border-width: 1px;
                border-style: solid;
                border-color: rgba(115, 115, 118, 0.3);
                border-image: initial;
                background-color: white;
                box-shadow: none;
                transition: border-color 150ms;
                resize: none;
                min-height: 32px;
                margin: 0px;
                border-radius: 6px;
                padding-right: 6px;
                padding-left: 6px;
              }
              .invalid {
                border-color: red;
              }
              .phone-warning {
                border-color: #ff6b35;
                background-color: #fff5f2;
              }
              #buttonContainer {
                display: flex;
                gap: 10px;
                margin-top: 10px;
                transition: opacity 0.3s ease;
              }
              #submitButton, #cancelButton {
                font-size: 15px;
                font-weight: 600;
                border: none;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
              }
              #submitButton {
                flex: 2;
                color: ${ui.primaryButtonTextColor};
                background: ${ui.primaryButtonColor};
              }
              #submitButton:hover:not(:disabled) {
                background: ${ui.primaryButtonColorHover};
              }
              #cancelButton {
                flex: 1;
                color: ${ui.destructiveButtonTextColor};
                background: ${ui.destructiveButtonColor};
              }
              #cancelButton:hover:not(:disabled) {
                background: ${ui.destructiveButtonColorHover};
              }
              #submitButton:disabled, #cancelButton:disabled {
                background: #ccc;
                cursor: not-allowed;
                color: #666;
              }
            </style>
      
            <div class="container">
              <div class="fieldset">
                <label for="firstName">Votre prénom*</label>
                <input type="text" class="firstName" name="firstName" required value="${savedData?.firstName || ''}" />
              </div>
      
              <div class="fieldset">
                <label for="lastName">Votre nom*</label>
                <input type="text" class="lastName" name="lastName" required value="${savedData?.lastName || ''}" />
              </div>
              
              <div class="fieldset">
                <label for="email">Votre email*</label>
                <input type="email" class="email" name="email" required value="${savedData?.email || ''}" />
              </div>
              
              <div class="fieldset">
                <label for="phoneNumber">Votre téléphone</label>
                <input type="text" class="phoneNumber" name="phoneNumber" value="${savedData?.phoneNumber || ''}" />
              </div>
              
              <div id="buttonContainer">
                <button id="submitButton" type="submit">${ui.primaryButtonTextLabel}</button>
                <button id="cancelButton" type="button">${ui.destructiveButtonTextLabel}</button>
              </div>
            </div>
          `;

        const submitButton = formContainer.querySelector('#submitButton');
        const cancelButton = formContainer.querySelector('#cancelButton');

        // Fonction pour sauvegarder les données du formulaire en temps réel
        function saveCurrentFormData() {
            const currentData = {
                firstName: formContainer.querySelector('.firstName').value,
                lastName: formContainer.querySelector('.lastName').value,
                email: formContainer.querySelector('.email').value,
                phoneNumber: formContainer.querySelector('.phoneNumber').value
            };
            saveFormData(currentData);
        }

        // Ajouter des listeners pour sauvegarder en temps réel
        const inputs = formContainer.querySelectorAll('input');
        const phoneInput = formContainer.querySelector('.phoneNumber');
        
        inputs.forEach(input => {
            input.addEventListener('input', saveCurrentFormData);
            input.addEventListener('blur', saveCurrentFormData);
        });

        // Gestion spéciale pour le téléphone
        phoneInput.addEventListener('blur', function() {
            const phoneValidation = validateAndFormatPhone(this.value);
            
            // Appliquer le formatage
            if (!phoneValidation.isEmpty) {
                this.value = phoneValidation.formatted;
            }
            
            // Appliquer le style selon la validité
            if (phoneValidation.isEmpty || phoneValidation.isValid) {
                this.classList.remove('phone-warning');
                console.log("📞 Téléphone valide ou vide");
            } else {
                this.classList.add('phone-warning');
                console.log("⚠️ Format de téléphone non reconnu");
            }
            
            // Sauvegarder après formatage
            saveCurrentFormData();
        });

        // Validation en temps réel pendant la saisie
        phoneInput.addEventListener('input', function() {
            // Supprimer le style d'avertissement pendant la saisie
            this.classList.remove('phone-warning');
        });

        formContainer.addEventListener('submit', function (event) {
            event.preventDefault();
            console.log("📋 Form submit déclenché");

            const firstName = formContainer.querySelector('.firstName');
            const lastName = formContainer.querySelector('.lastName');
            const email = formContainer.querySelector('.email');
            const phoneNumber = formContainer.querySelector('.phoneNumber');

            console.log("📋 Valeurs du formulaire:");
            console.log("📋 - firstName:", firstName.value);
            console.log("📋 - lastName:", lastName.value);
            console.log("📋 - email:", email.value);
            console.log("📋 - phoneNumber:", phoneNumber.value);

            if (
              !firstName.checkValidity() ||
              !lastName.checkValidity() ||
              !email.checkValidity()
            ) {
                console.log("❌ Validation échouée");
                firstName.classList.add('invalid');
                lastName.classList.add('invalid');
                email.classList.add('invalid');
                return;
            }

            console.log("✅ Validation réussie, envoi API...");
            submitButton.disabled = true;
            cancelButton.disabled = true;

            const requestBody = {
                ...data,
                firstName: firstName.value || null,
                lastName: lastName.value || null,
                email: email.value || null,
                phoneNumber: phoneNumber.value || null,
            };

            if (!api) return; // or display an error to the user
            console.log("📋 Corps de la requête API:", requestBody);
            console.log("📋 URL API:", api.endpoint);
            console.log("📋 Headers API:", {
                Authorization: api.key,
                'Content-Type': 'application/json',
            });

            // Send data to API instead of voiceflow
            fetch(api.endpoint, {
              method: 'POST',
              headers: {
                Authorization: api.key,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            })
              .then((response) => {
                console.log("📋 Réponse API reçue:", response.status);
                return response.json();
              })
              .then((record) => {
                console.log("📋 Données API:", record);
                console.log("📋 Envoi de 'complete' à Voiceflow avec ID:", record.id);
                
                // Supprimer les données sauvegardées après envoi réussi
                clearFormData();
                
                window.voiceflow.chat.interact({
                  type: 'complete',
                  payload: {
                    id: record.id,
                  },
                });
              })
              .catch((error) => {
                console.error("❌ [API] Error:", error);
                console.log("📋 Envoi de 'error' à Voiceflow");
                // Continue with voiceflow even if API call fails
                window.voiceflow.chat.interact({
                  type: 'error',
                });
              });
        });

        cancelButton.addEventListener('click', () => {
            console.log("📋 Cancel button cliqué");
            submitButton.disabled = true;
            cancelButton.disabled = true;

            // push cancel event to voiceflow runtime
            window.voiceflow.chat.interact({
              type: 'cancel',
            });
        });

        console.log("📋 Ajout du formulaire au DOM");
        element.appendChild(formContainer);
        console.log("📋 === FIN RENDER LEAD FORM ===");
    },
};

// Attendre que le DOM soit complètement chargé
console.log("⏳ Attente du DOM...");
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM ready, démarrage du processus...");
    
    // Extraire la référence de la page
    const pageReference = extractReference();
    console.log("🔍 === ANALYSE DES REFERENCES ===");
    console.log("🔍 Référence trouvée sur la page:", pageReference);
    console.log("🔍 Type de pageReference:", typeof pageReference);
    
    // Récupérer la référence stockée
    const storedReference = localStorage.getItem('ARIreference');
    const referenceTimestamp = localStorage.getItem('ARIreference_timestamp');
    
    console.log("🔍 Référence stockée:", storedReference);
    console.log("🔍 Type de storedReference:", typeof storedReference);
    console.log("🔍 Timestamp référence:", referenceTimestamp);
    console.log("🔍 Timestamp valide:", isStoredValueValid(referenceTimestamp));
    
    let shouldOpenChatAutomatically = false;
    
    // Vérifier si les références correspondent
    if (pageReference && storedReference && isStoredValueValid(referenceTimestamp) && pageReference === storedReference) {
        console.log("✅ Les références correspondent, le widget s'ouvrira automatiquement");
        shouldOpenChatAutomatically = true;
    } else {
        console.log("❌ Les références ne correspondent PAS");
        console.log("❌ - pageReference existe:", !!pageReference);
        console.log("❌ - storedReference existe:", !!storedReference);
        console.log("❌ - timestamp valide:", isStoredValueValid(referenceTimestamp));
        console.log("❌ - références égales:", pageReference === storedReference);
        console.log("❌ - pageReference == storedReference:", pageReference == storedReference);
    }
    console.log("🔍 === FIN ANALYSE REFERENCES ===");
    
    // Chargement du widget Voiceflow
    console.log("🎯 === DEBUT CHARGEMENT VOICEFLOW ===");
    (function(d, t) {
        console.log("🎯 Création de l'élément script Voiceflow...");
        var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
        
        v.onload = function() {
            console.log("✅ Script Voiceflow chargé avec succès !");
            console.log("🎯 window.voiceflow existe:", typeof window.voiceflow !== 'undefined');
            console.log("🎯 window.voiceflow.chat existe:", typeof window.voiceflow?.chat !== 'undefined');
            
            const voiceflowConfig = {
                verify: { projectID: '6819bf11112241a9c004a047' },
                url: 'https://general-runtime.voiceflow.com',
                versionID: versionID,
                assistant: { 
                    extensions: [CustomOpenURLExtension, LeadFormExtension],
                    stylesheet:'https://ea-ari-demo1.vercel.app/voiceflow.fr.css'
                },
                voice: { 
                    url: "https://runtime-api.voiceflow.com" 
                }
            };
            
            console.log("🎯 Configuration Voiceflow:", voiceflowConfig);
            console.log("🎯 Extensions chargées:", voiceflowConfig.assistant.extensions.map(ext => ext.name));
            
            // Charger le widget
            console.log("🎯 Appel de window.voiceflow.chat.load...");
            window.voiceflow.chat.load(voiceflowConfig)
                .then(() => {
                    console.log("✅ Widget Voiceflow chargé avec succès !");
                    console.log("🎯 shouldOpenChatAutomatically:", shouldOpenChatAutomatically);
                    
                    if (shouldOpenChatAutomatically) {
                        // Ouvrir automatiquement le widget après 5 secondes si les références correspondent
                        console.log("⏰ Programmation ouverture automatique dans 5 secondes...");
                        setTimeout(() => {
                            console.log("🚀 Ouverture automatique du widget Voiceflow");
                            window.voiceflow.chat.open();
                            
                            const ariResume = localStorage.getItem('ARIresume');
                            console.log('📋 ARIresume :', ariResume);
                            console.log('📋 ARIresume type:', typeof ariResume);
                            
                            if (ariResume == true || ariResume == "true"){
                                console.log('🔄 Mode resume activé');
                                localStorage.setItem('ARIresume', false);
                                const eventPayload = {"type": "event","payload": {"event": {"name": "resume_carousel"}}};
                                console.log('🔄 Envoi event resume:', eventPayload);
                                window.voiceflow.chat.interact(eventPayload);
                            } else {
                                console.log('📋 Mode resume non activé');
                            }
                        }, 5000);
                    } else {
                        console.log("📋 Pas d'ouverture automatique prévue");
                        // Premier message après 3 secondes
                        setTimeout(() => {
                        console.log("🚀 Envoi message proactif #1");
                        window.voiceflow.chat.proactive.push({
                            type: 'text',
                            payload: { message: "Besoin d'aide ?" }
                        });
                        }, 3000);

                        // Second message 1 seconde plus tard
                        setTimeout(() => {
                        console.log("🚀 Envoi message proactif #2");
                        window.voiceflow.chat.proactive.push({
                            type: 'text',
                            payload: {
                            message: "Essayez ARI, notre assistant avec intelligence artificielle pour vous accompagner dans votre projet immobilier."
                            }
                        });
                        }, 4500);
                    }
                })
                .catch(err => {
                    console.error("❌ Erreur lors du chargement du widget Voiceflow:", err);
                    console.error("❌ Stack trace:", err.stack);
                });
        };
        
        v.onerror = function(error) {
            console.error("❌ Erreur lors du chargement du script Voiceflow:", error);
        };
        
        v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
        v.type = "text/javascript";
        console.log("🎯 URL du script:", v.src);
        console.log("🎯 Ajout du script au DOM...");
        s.parentNode.insertBefore(v, s);
        console.log("🎯 Script ajouté au DOM avec succès");
    })(document, 'script');
    
    console.log("🎯 === FIN CONFIGURATION CHARGEMENT ===");
});

console.log("✅ => ea-ari.js - FIN DU SCRIPT, attente DOM...");