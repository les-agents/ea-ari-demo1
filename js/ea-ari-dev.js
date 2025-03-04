

  (function(d, t) {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        window.voiceflow.chat.load({
          verify: { projectID: '67c42da6a9ca2ac532c2c721' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production'
        });
      }
      v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
  })(document, 'script');


/*
(function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
        window.voiceflow.chat.load({
            verify: { projectID: '67c42da6a9ca2ac532c2c721' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'development', 
            assistant: { 
                extensions: [CustomOpenURLExtension],
                stylesheet:'https://ea-ari-demo1.vercel.app/voiceflow.fr.css'
             }
             
            voice: { 
                url: "https://runtime-api.voiceflow.com" 
            }
                
        });
    };
    //v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
    v.type = "text/javascript";
    s.parentNode.insertBefore(v, s);
})(document, 'script');
*/