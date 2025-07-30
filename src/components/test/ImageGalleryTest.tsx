import React from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ImageGalleryTest: React.FC = () => {
  const testImages = [
    {
      src: 'https://images.unsplash.com/photo-1552053110-0b6e75d24dba?w=800&h=600&fit=crop',
      alt: 'Golden Retriever running',
      title: 'Golden Retriever'
    },
    {
      src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop',
      alt: 'Cute orange cat',
      title: 'Orange Cat'
    },
    {
      src: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=600&fit=crop',
      alt: 'Happy Labrador',
      title: 'Labrador'
    },
    {
      src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
      alt: 'Colorful parrots',
      title: 'Tropical Birds'
    },
    {
      src: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=600&fit=crop',
      alt: 'Cute hamster',
      title: 'Hamster'
    },
    {
      src: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=800&h=600&fit=crop',
      alt: 'German Shepherd',
      title: 'German Shepherd'
    },
    {
      src: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop',
      alt: 'Wild deer',
      title: 'Wild Deer'
    },
    {
      src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop',
      alt: 'Ocean waves',
      title: 'Ocean Waves'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🖼️ Test Lazy Loading Images</CardTitle>
          <CardDescription>
            Scorri verso il basso per testare il caricamento lazy delle immagini.
            Apri DevTools → Network per vedere quando si caricano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testImages.map((image, index) => (
              <div key={index} className="space-y-3">
                <LazyImage
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-48 rounded-lg object-cover shadow-md"
                  containerClassName="bg-muted rounded-lg"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjEyMCIgcj0iMzAiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+"
                  onLoad={() => console.log(`Image ${index + 1} loaded: ${image.title}`)}
                  onError={() => console.log(`Image ${index + 1} failed to load: ${image.title}`)}
                />
                <h3 className="font-semibold text-center">{image.title}</h3>
              </div>
            ))}
          </div>
          
          {/* Test error fallback */}
          <div className="mt-8 pt-8 border-t">
            <h4 className="font-semibold mb-4">Test Error Fallback:</h4>
            <LazyImage
              src="https://non-existent-url.com/image.jpg"
              alt="This image should fail"
              className="w-48 h-48 rounded-lg object-cover"
              containerClassName="bg-muted rounded-lg"
              fallbackSrc="/default-avatar.png"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGalleryTest;