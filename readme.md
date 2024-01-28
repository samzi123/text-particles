# text-particles
A React component that converts any text into interactive particles.

![Example](https://instagram-caption-tool.s3.amazonaws.com/hiMomDemo-text-particles.gif)

## Installation
Using npm:
`npm install text-particles`

Using yarn:
`yarn add text-particles`

## Usage
```javascript 
import TextToParticles from 'text-particles';

const App = () => {
  return (
    <TextToParticles
      text="Hi mom!"
      fontSize={100}
      color="orange"
    />
  );
};

export default App;
```

## Props
The `<TextToParticles>` component accepts the following props:
- `text` (string) *required*: Text to apply the effect to.
- `font` (string) *optional*: Font to use, e.g. `'Arial'`. Defaults to `sans-serif`.
- `fontSize` (number) *optional*: Font size in pixels. Defaults to `30`.
- `color` (string) *optional*: Color of the particles, e.g. `orange`, `#FFA500`, `rgb(255 165 0 / 100%)`. Defaults to black.
- `backgroundColor` (string) *optional*: Hex code for the background color of the particles. If not specified, the background will be transparent.
- `mouseRadius` (number) *optional*: Radius of the mouse interaction in pixels. Defaults to `fontSize / 3`.
- `numParticles` (number) *optional*: Number of particles to use.
- `particleSize` (number) *optional*: Size of each particle in pixels. Defaults to `2`.

## Author
Samuel Henderson

Contributions are welcome!
Repo: https://github.com/samzi123/text-particles

## License
MIT