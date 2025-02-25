export const CustomOpenURLExtension = {
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