(function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    
    v.onload = function() {
        window.voiceflow.chat.load({
            verify: { projectID: '679bba21dbd2e6376007c5b8' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production'
        });
    };
    
    v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; 
    v.type = "text/javascript";
    
    s.parentNode.insertBefore(v, s);
})(document, 'script');