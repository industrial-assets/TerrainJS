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
    
    var Voronoi = function () {};
    var p = Voronoi.prototype;
    
    
    p.init = function(canvasId, width, height, numFeatures, featureIntensity) {
		
        //initialize local variables
        this.numFeatures = numFeatures,
        this.featureIntensity = featureIntensity;

		//generate points
		this.points = this.getPoints(width, height);
		
		//draw points
		this.draw(width, height);
        
	}
	
    
    
	p.draw = function(width, height) {
		
		//var mapData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var inc = 0;
		for (var x = 0; x < width; x++)
		{
			for (var y = 0; y < height; y++)
			{
				//get color for each pixel
				var color = this.getColor(this.points[x][y]);
				var rnum, gnum, bnum, anum;
				rnum = inc++;
				gnum = inc++;
				bnum = inc++;
				anum = inc++;
				TerrainJS.mapData.data[rnum] = (TerrainJS.mapData.data[rnum]/3) + (color.r/4);
				TerrainJS.mapData.data[gnum] = (TerrainJS.mapData.data[gnum]/3) + (color.g/4);
				TerrainJS.mapData.data[bnum] = (TerrainJS.mapData.data[bnum]/3) + (color.b/4);
				TerrainJS.mapData.data[anum] = 255;
			}
		}
		
	}
	
    
    
	p.getPoints = function(width, height) {  
		
		// create features
		var features = [];
		for (var featnum=0;featnum<this.numFeatures;featnum++){
			features.push({x:Math.floor(Math.random()*width), y:Math.floor(Math.random()*height)})
		}
		
		var points = [];
		for (var x = 0; x < width; x++)
		{
			points[x] = []
			for (var y = 0; y < height; y++)
			{
				
				var distArray = []
				for (var f=0;f<features.length;f++) {
					var d = (Math.pow(features[f].y - y,2) + Math.pow(features[f].x - x,2)) * this.featureIntensity;
					distArray.push(d);
				}
				distArray.sort(function(a,b){return a - b});
				var h = (-1*(distArray[0])) + (1*(distArray[1]));
				points[x].push(h);
			}
		}
		
		return points;
	}

	
	p.getColor = function(c) {
		var red = 0, green = 0, blue = 0;
	
		red = green = blue = c;

		return {
			r: red,
			g: green,
			b: blue
		};
	}
    
    
    TerrainJS.Voronoi = Voronoi;
    
    
}());