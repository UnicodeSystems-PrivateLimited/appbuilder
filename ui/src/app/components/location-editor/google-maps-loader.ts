const googleMapsURL: string = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAuO7iGIuK0NsNL0fHTUpaTDB7QZNX7aio&libraries=places&callback=__onGoogleMapsLoaded";

export class GoogleMapsLoader {

    private static promise;

    public static load(): Promise<any> {
        if (!GoogleMapsLoader.promise) {
            GoogleMapsLoader.promise = new Promise((resolve) => {
                // Set callback for when google maps is loaded.
                window['__onGoogleMapsLoaded'] = (ev) => {
                    resolve(window['google']['maps']);
                };

                // Add script tag to load google maps, which then triggers the callback, which resolves the promise with windows.google.maps.
                let node = document.createElement('script');
                node.src = googleMapsURL;
                node.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }
        return GoogleMapsLoader.promise;
    }

}