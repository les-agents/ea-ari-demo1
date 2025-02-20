const CustomOpenUrlExtension = {
    name: 'Custom_Open_URL',
    type: 'effect',
    match: ({ trace }) => trace.type === 'Custom_Open_URL',
    effect: ({ trace }) => {
      const url = trace.payload.url;
      if (url) {
        window.open(url, '_self'); // Ouvre l'URL dans la même fenêtre
      }
    }
  };