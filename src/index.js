import React, { useRef, useEffect } from "react";

export default function TextToParticles({ text="", particleSize=2, numParticles=null, fontSize=30, backgroundColor="transparent", color="#000000", mouseRadius = fontSize / 3, font="sans-serif" }) {
    const canvasAsRef = useRef(null);
    var height;
    var width;
    const xPadding = fontSize / 2;
    const yPadding = fontSize / 2;
    
    // used to determine if a particle is close enough to the mouse to be affected by it
    const maxDistanceSquared = mouseRadius * mouseRadius;
    const particleSizeSquared = particleSize * particleSize;
    var hasLoaded = false;

    // use spacial partitioning grid to speed up lookup of particles close to the mouse
    const positionGrid = [];
    var positionGridRows;
    var positionGridCols;

    useEffect(() => {
        class GridCell {
            constructor() {
                this.particles = new Set();
            }
    
            addParticle(particle) {
                this.particles.add(particle);
            }
    
            removeParticle(particle) {
                this.particles.delete(particle);
            }
        }

        const canvas = canvasAsRef.current;
        const ctx = canvas.getContext("2d");
        
        let particleArr = [];
        let mouseMoved = false;
        let mouse = {
            x: null,
            y: null,
            radius: mouseRadius,
        }

        if (backgroundColor === "transparent" || backgroundColor === "") {
            backgroundColor = "rgba(0, 0, 0, 0)";
        }
        
        window.addEventListener('mousemove', function(event){
            const rect = canvas.getBoundingClientRect();

            mouse.x = event.clientX - rect.left
            mouse.y = event.clientY - rect.top
            mouseMoved = true;
        });

        function createPositionGrid() {
            for (let i = 0; i < positionGridRows; i++) {
                positionGrid[i] = [];
                for (let j = 0; j < positionGridCols; j++) {
                    // todo: use a linked list instead of a set
                    positionGrid[i][j] = new GridCell();
                }
            }
        }
        
        function drawImage(data) {
            class Particle {
                constructor(x, y, color, size) {
                    this.x = x;
                    this.y = y;
                    this.color = color;
                    this.size = size;
                    this.baseX = this.x;
                    this.baseY = this.y;
                    this.density = (Math.random() * 30) + 1;
                    this.positionGridRow = Math.floor(this.y / mouseRadius);
                    this.positionGridCol = Math.floor(this.x / mouseRadius);
                }
        
                draw() {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }

                calculateGridPosition() {
                    const row = Math.floor(this.y / mouseRadius);
                    const col = Math.floor(this.x / mouseRadius);

                    // recalculate the grid position if the particle has moved to a new cell
                    if ((row !== this.positionGridRow || col !== this.positionGridCol)){
                        if (row >= 0 && row < positionGridRows && col >= 0 && col < positionGridCols) {
                            if (this.positionGridCol !== -1 && this.positionGridRow !== -1) {
                                positionGrid[this.positionGridRow][this.positionGridCol].removeParticle(this);
                            }

                            positionGrid[row][col].addParticle(this);
                            this.positionGridRow = row;
                            this.positionGridCol = col;
                        } else {
                            this.positionGridRow = -1;
                            this.positionGridCol = -1;
                        }
                    }
                }
        
                update() {
                    // collision detection with mouse
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distanceSquared = Math.abs(dx * dx + dy * dy);

                    // add force to particle if it is close to the mouse
                    if (mouseMoved && distanceSquared < maxDistanceSquared + particleSizeSquared) {
                        const forceDirectionX = dx / mouseRadius;
                        const forceDirectionY = dy / mouseRadius;
                        const forceToApply = 1 - (distanceSquared / maxDistanceSquared);
            
                        const directionX = forceDirectionX * forceToApply * this.density;
                        const directionY = forceDirectionY * forceToApply * this.density;
        
                        this.x -= directionX;
                        this.y -= directionY;

                        this.calculateGridPosition();
                    }
                }

                // apply force to move particle back to original position
                applyForceBackToOriginalPosition() {
                    this.x -= (this.x - this.baseX) / 15;
                    this.y -= (this.y - this.baseY) / 15;
                    this.calculateGridPosition();
                }
            }
        
            function init() {
                particleArr = [];
                // can't have more particles than pixels
                const numPixelsWithPositiveAlpha = data.data.filter((_, i) => i % 4 === 3 && data.data[i] > 128).length;
                numParticles = Math.min(numParticles, numPixelsWithPositiveAlpha);
        
                for (let y = 0, y2 = data.height; y < y2; y++) {
                    for (let x = 0, x2 = data.width; x < x2; x++) {
                        if (data.data[(y * 4 * data.width) + (x * 4) + 3] > 128) {
                            // calculate if we wanna show this particle or not to reach the desired number of particles
                            if (numParticles < numPixelsWithPositiveAlpha && Math.random() > numParticles / numPixelsWithPositiveAlpha) {
                                continue;
                            }
        
                            const positionX = Math.floor((x / data.width) * canvas.width) + xPadding;
                            const positionY = Math.floor((y / data.height) * canvas.height) + yPadding;
                  
                            particleArr.push(new Particle(positionX, positionY, color, particleSize));

                            // add particle to spatial optimization grid
                            const row = Math.floor(positionY / mouseRadius);
                            const col = Math.floor(positionX / mouseRadius);

                            if (row < 0 || row >= positionGridRows || col < 0 || col >= positionGridCols)
                                continue;

                            positionGrid[row][col].particles.add(particleArr[particleArr.length - 1]);
                        }
                    }
                }
            }

            function animate() {
                requestAnimationFrame(animate);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // only draw particles that are close to the mouse
                const mouseRow = Math.floor(mouse.y / mouseRadius);
                const mouseCol = Math.floor(mouse.x / mouseRadius);
                const rowColOffsets = [[0,1], [0,-1], [1,1], [1,-1], [1,0], [-1,0], [0,0], [-1,-1], [-1,1]];
                
                // loop through all cells around the mouse and update the particles in those cells
                if (mouseMoved) {
                    for (let i = 0; i < rowColOffsets.length; ++i) {
                        const particleRow = mouseRow + rowColOffsets[i][0];
                        const particleCol = mouseCol + rowColOffsets[i][1];
                        
                        if (particleRow < 0 || particleRow >= positionGridRows || particleCol < 0 || particleCol >= positionGridCols)
                            continue;
                    
                        for (const particle of positionGrid[particleRow][particleCol].particles) {
                            particle.update();
                        }
                    }
                }
            
                //draw all particles
                for (let i = 0; i < particleArr.length; i++) {
                    // if the particle has moved away from its original position, move it back
                    if (particleArr[i].x !== particleArr[i].baseX || particleArr[i].y !== particleArr[i].baseY) {
                        particleArr[i].applyForceBackToOriginalPosition();
                    }

                    particleArr[i].draw();
                }

                mouseMoved = false;
            }
        
            init();
            animate();
        }

        // creates particles that take the form of some text
        function createBitmap(inputText) {
            ctx.font = fontSize + "px " + font;
            const measureText = ctx.measureText(inputText);
            width = measureText.width + xPadding * 2;
            height = measureText.fontBoundingBoxAscent + measureText.fontBoundingBoxDescent + yPadding * 2;
            canvas.width  = width;
            canvas.height = height;

            ctx.fillStyle = "white";
            ctx.font = fontSize + "px " + font;
            ctx.fillText(inputText, 0, fontSize);
            
            const bitmap = createImageBitmap(canvas);

            positionGridRows = Math.ceil(height / mouseRadius);
            positionGridCols = Math.ceil(width / mouseRadius);

            createPositionGrid();
            // scale the number of particles based on the text size and the particle size, unless the user has specified a number of particles
            numParticles = numParticles || Math.ceil(width * height / (30 * particleSize));

            return bitmap;
        }
        
        /** @param {ImageBitmap} bitmap */
        function readImageData (bitmap) {
            const { width: w, height: h } = bitmap
            const _canvas = new OffscreenCanvas(w, h)
            const _ctx = _canvas.getContext('2d')
        
            _ctx.drawImage(bitmap, 0, 0)
            const imageData = _ctx.getImageData(0, 0, w, h)
        
            return imageData;
        }
        
        window.addEventListener('load', function() {    
            if (hasLoaded || !text) {
                return;
            }
            
            createBitmap(text)
                .then(readImageData)
                .then(pixels => {
                    drawImage(pixels);
                });

            hasLoaded = true;
        });
    }, []);

  return (
    <canvas ref={canvasAsRef} />
  );
}