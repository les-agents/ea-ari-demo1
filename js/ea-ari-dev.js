//ea-ari.js
const CustomOpenURLExtension = {
    name: "CustomOpenURLExtension",
    type: "effect",

    match: ({ trace }) => {
        return trace.type === "CustomOpenURLExtension";
    },

    effect: ({ trace }) => {
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

// Log the current page URL
console.log("Current page URL:", window.location.href);

// Extract URL parameters
const urlParams = new URLSearchParams(window.location.search);
const userParam = urlParams.get('user');
console.log("User parameter:", userParam);

(function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
        window.voiceflow.chat.load({
            verify: { projectID: '679bba21dbd2e6376007c5b8' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production',
            userID: userParam, 
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