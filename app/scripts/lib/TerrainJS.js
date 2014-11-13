/*

The MIT License (MIT)

Copyright (c) 2014 John Bower @beclamide

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/



var TerrainJS = TerrainJS || {};


(function () {
    
    var Engine = function (containerID) { this.$init(containerID); };
    var p = Engine.prototype;
    
    
    p.$init = function (containerID) {
        
        var me = this;
      
        var viewContainer = document.getElementById( containerID );
	
        this.camera = new THREE.PerspectiveCamera( 60, (window.innerWidth-256) / window.innerHeight, 1, 20000 );

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth-256, window.innerHeight );


        // lights

        var light1 = new THREE.DirectionalLight(0xffffff);
        light1.position.set(1, 1, 1);
        light1.castShadow = true;
        this.scene.add(light1);

        var ambientlight = new THREE.AmbientLight(0x222222);
        this.scene.add(ambientlight); 


        viewContainer.appendChild( this.renderer.domElement );


        // get preview canvas
        this.heightmapPreviewCanvas = document.getElementById("heightmapPreviewCanvas");
        this.heightmapPreviewCTX = this.heightmapPreviewCanvas.getContext("2d");

        this.heightmapCanvas = document.createElement("canvas");
        this.heightmapCanvasCTX = this.heightmapCanvas.getContext("2d");
        
        this.plasma = new TerrainJS.Plasma();
        this.plasmaConfig = {
            roughness: 0
        }
        
        this.voronoi = new TerrainJS.Voronoi();
        this.voronoiConfig = {
            numFeatures: 10,
	        featureIntensity: 2
        }

        $(window).on( 'resize', function () {
            me.onWindowResize();
        });
        
    };
    
    
    p.StartRender = function (width, height, roughness, features, intensity) {
		
		this.plasmaConfig.rough = roughness;

		this.heightmapCanvas.width = width;
		this.heightmapCanvas.height = height;
		
		this.voronoiConfig.numFeatures = features;
		this.voronoiConfig.featureIntensity = intensity;
		
		TerrainJS.mapData = this.heightmapCanvasCTX.getImageData(0, 0, width, height);
		
		this.DrawHeightmap(TerrainJS.mapData);
		
		this.heightmapCanvasCTX.putImageData(TerrainJS.mapData,0,0);
		
		this.UpdatePreviewCanvas();
		
		this.CreateTerrain();
		
		this.Render();
        
    }
    
    
    p.DrawHeightmap = function () {
	
        this.plasma.init(this.heightmapCanvas.width, this.heightmapCanvas.height, this.plasmaConfig.rough)

        this.voronoi.init(this.heightmapCanvas, this.heightmapCanvas.width, this.heightmapCanvas.height, this.voronoiConfig.numFeatures, this.voronoiConfig.featureIntensity);

    };
    
    
    p.CreateTerrain = function () {
        
        var worldWidth = this.heightmapCanvas.width;
        var worldHeight = this.heightmapCanvas.height

        var geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth-1, worldHeight-1 );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

        //var mapData = ctx.getImageData(0, 0, heightmapCanvas.width, heightmapCanvas.height);
        var data = [];
        var highestPoint = 0;
        var inc = 0;
        for (var x = 0; x < worldWidth; x++)
        {
            for (var y = 0; y < worldHeight; y++)
            {

                //get color for each pixel
                data.push(TerrainJS.mapData.data[inc]);

                inc+=4;
            }
        }

        for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

            geometry.vertices[ i ].y = data[i] * 5;
            if (data[i]*5 > highestPoint) highestPoint = data[i]*5;

        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();



        this.camera.position.y = highestPoint*2;
        this.camera.position.z = 7500/2;
        this.camera.position.x = -7500/2;
        this.camera.lookAt( new THREE.Vector3(0,0,0))

        texture = new THREE.Texture( this.GenerateTexture(data, worldWidth, worldHeight), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping );
        texture.needsUpdate = true;

        this.scene.remove(this.mesh);
        this.mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture } ) );
        this.mesh.recieveShadow = true;
        this.mesh.castShadow = true;
        this.scene.add( this.mesh );
        
    }
    
    
    
    p.GenerateTexture = function (data, width, height) {

        var texcanvas, texcanvasScaled, context, image, imageData;

        texcanvas = document.createElement('canvas');
        texcanvas.width = width;
        texcanvas.height = height;

        context = texcanvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);

        image = context.getImageData(0, 0, texcanvas.width, texcanvas.height);
        imageData = image.data;

        var inc=0
        for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

            imageData[i] = 255//data[inc];
            imageData[i + 1] = 255//data[inc];
            imageData[i + 2] = 255//data[inc];

            inc++;
        }

        context.putImageData(image, 0, 0);

        // Scaled 4x

        texcanvasScaled = document.createElement('canvas');
        texcanvasScaled.width = width * 4;
        texcanvasScaled.height = height * 4;

        context = texcanvasScaled.getContext('2d');
        context.scale(4, 4);
        context.drawImage(texcanvas, 0, 0);

        image = context.getImageData(0, 0, texcanvasScaled.width, texcanvasScaled.height);
        imageData = image.data;

        for (var i = 0, l = imageData.length; i < l; i += 4) {

            var v = ~~(Math.random() * 5 );

            imageData[i] += v;
            imageData[i + 1] += v;
            imageData[i + 2] += v;

        }

        context.putImageData(image, 0, 0);

        return texcanvasScaled;

    }

    p.Render = function() {

        this.renderer.render(this.scene, this.camera);

    }

    p.onWindowResize = function() {

        this.camera.aspect = (window.innerWidth-256) / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth-256, window.innerHeight);

        this.Render();

    }


    p.UpdatePreviewCanvas = function() {

        this.heightmapPreviewCTX.drawImage(this.heightmapCanvas,0,0, 256, 256);
        this.heightmapPreviewCTX.restore();

    }
    
    
    TerrainJS.Engine = Engine;
    
}());