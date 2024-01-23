# react-image-particles
A React component that converts any text into interactive particles.

![Example](https://instagram-caption-tool.s3.amazonaws.com/demo.gif)

## Installation
Using npm:
`npm install react-text-particles`

Using yarn:
`yarn add react-tex-particles`

## Usage
```javascript 
import React from 'react';
import ImageToParticle from 'react-image-particles';

const App = () => {
  return (
    <TextToParticles
      text="Hi mom!"
      fontSize={100}
      numParticles={1000}
    />
  );
};

export default App;
```

## Props
The `<TextToParticles>` component accepts the following props:
- `text` (string) *required*: Text to apply the effect to.
- `fontSize` (number) *optional*: Font size in pixels.
- `particleSize` (number) *optional*: Size of each particle in pixels.
- `numParticles` (number) *optional*: Number of particles to use. Defaults to the number of pixels in the image.

## Author
Samuel Henderson

Contributions are welcome!
Repo: https://github.com/samzi123/react-text-particles

## License
MIT