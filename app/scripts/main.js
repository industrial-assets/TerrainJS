
$(document).ready(function () {
   
    var terrainJS = new TerrainJS.Engine('viewContainer');
    
    
    $('#renderButton').on('click', function () {
       
        var width = $("#mapResolution")[0].value;
		var height = $("#mapResolution")[0].value;
		var roughness = $("#mapRoughness")[0].value;
        var features = $("#mapFeatures")[0].value;
		var intensity = $("#mapFeatureIntensity")[0].value;
        
        terrainJS.StartRender(width, height, roughness, features, intensity);
        
    });
    
});