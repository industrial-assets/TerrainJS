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

/*jshint bitwise: false*/

var TerrainJS = TerrainJS || {};

(function () {
    
    'use strict';
    
    var Plasma = function () { };
    var p = Plasma.prototype;
    
    p.init = function (width, height, roughness) {
        
        //initialize variables
        this.points = [];

		//generate points
		this.getPoints(width, height, roughness);
		
		//draw points
		this.draw(width, height);
        
    };
    
    
    p.draw = function(width, height) {
        
		var inc = 0;
		for (var x = 0; x < width; x++)
		{
			for (var y = 0; y < height; y++)
			{
				//get color for each pixel
				var color = this.getColor(this.points[x][y]);
				TerrainJS.mapData.data[inc++] = color.r * 255;
				TerrainJS.mapData.data[inc++] = color.g * 255;
				TerrainJS.mapData.data[inc++] = color.b * 255;
				TerrainJS.mapData.data[inc++] = 255;
			}
		}
        
	};
    
    
    p.getPoints = function(width, height, roughness) {
        
		var p1, p2, p3, p4;  
		for (var x = 0; x < width; x++)
		{
			this.points[x] = [];
		}
		//give corners random colors
		p1 = Math.random();
		p2 = Math.random();
		p3 = Math.random();
		p4 = Math.random();
		this.splitRect( 0, 0, width, height, p1, p2, p3, p4, roughness);
        
	};

    
	p.splitRect = function( x, y, width, height, p1, p2, p3, p4, roughness) {
        
		var side1, side2, side3, side4, center;
		var transWidth = ~~(width / 2);
		var transHeight = ~~(height / 2);
		
		//as long as square is bigger then a pixel..
		if (width > 1 || height > 1)
		{  
			//center is just an average of all 4 corners
			center = ((p1 + p2 + p3 + p4) / 4);
			
			//randomly shift the middle point 
            var totalSize = width + height;
			center += this.shift(transWidth + transHeight, totalSize*20, roughness);
			
			//sides are averages of the connected corners
			//p1----p2
			//|     |
			//p4----p3
			side1 = ((p1 + p2) / 2);
			side2 = ((p2 + p3) / 2);
			side3 = ((p3 + p4) / 2);
			side4 = ((p4 + p1) / 2);
			
			//its possible that middle point was moved out of bounds so correct it here
			center = this.normalize(center);
			side1 = this.normalize(side1);
			side2 = this.normalize(side2);
			side3 = this.normalize(side3);
			side4 = this.normalize(side4);
			
			//repear operation for each of 4 new squares created
			this.splitRect( x, y, transWidth, transHeight, p1, side1, center, side4, roughness);
			this.splitRect( x + transWidth, y, width - transWidth, transHeight, side1, p2, side2, center, roughness);
			this.splitRect( x + transWidth, y + transHeight, width - transWidth, height - transHeight, center, side2, p3, side3, roughness);
			this.splitRect( x, y + transHeight, transWidth, height - transHeight, side4, center, side3, p4, roughness);
		}
		else 
		{
			//when last square is just a pixel, simply average it from the corners
			this.points[x][y]= (p1 + p2 + p3 + p4) / 4;
		}
        
	};

	p.normalize = function(val) {  
		return (val < 0) ? 0 : (val > 1) ? 1 : val;
	};
  
	p.shift = function(smallSize, totalSize, roughness) { 
		return (Math.random() - 0.5) * smallSize / totalSize * roughness;
	};
	
	p.getColor = function(c) {
		var red = 0, green = 0, blue = 0;
	
		red = green = blue = c;

		return {
			r: red,
			g: green,
			b: blue
		};
	};
    
    
    TerrainJS.Plasma = Plasma;
    
    
}());
