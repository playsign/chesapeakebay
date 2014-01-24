var rtt = null; //the current rtt target image used. what happens when it is removed? clean js execption?

/*
var camerainfo = [ //source camera, and the button object used to switch to that
    ["FreeLookCamera", "button_freecam"],
    ["cam_mallard", "button_red"],
//    ["box_blue_cam", "button_blue"],
//    ["box_green_cam", "button_green"]
];*/
var cameraidx = 0;
var cameralist = ["FreeLookCamera", "cam_mallard", "cam_deer", "cam_rtt"];

var target_camera_distance = 2.0;
var target_camera_height = 0.25;
var target = null; //guard is created by fishgame, so let's delay this fetch
var targetcam = null;

function init() {
    //this could be just a straight setup script with no funcs,
    //but is apparently executed too early -- e.g. the camera is not there yet.
    //so have to wrap in a func and make a trick to run with a delay

    /* create all RttTargets, i.e. the component for each cam that we want image from
       note: a simpler approach might be to use a single cam that moves,
       but am now testing if this works fine also to verify that RttTarget works for multiple.
       and this tech of having multiple cams and switching between them can be simpler.
       possibly nice that they all have own textures, so can use those also when that cam is not active.
    */
    /*var info, camname, butname;
    for (var i in camerainfo) {
        info = camerainfo[i];
        camname = info[0];
        butname = info[1];*/
    var camname;
    for (var i = 0; i < cameralist.length; i++) {
        camname = cameralist[i];
        rtt = createRttTarget(camname); //leaves the last in the list as current
        //bindButton(camname, butname);
    }

    setImageSource(scene.GetEntityByName(camname));    
}

function createRttTarget(camname) {
    //could also have a camera in the scene xml with this component,
    //but here instead am using the pre-existing default cam
    //to make the demo simple, i.e. can just move the cam to see rtt working

    //apparently EC_Camera does not persist, so we have to create them here XXX \todo
    //.. adding with the GUI editing was fun and worked otherwise
    var cam = scene.GetEntityByName(camname);
    var cam_ec = cam.GetOrCreateComponent("EC_Camera");
//    cam_ec.AutoSetPlaceable();

    cam.GetOrCreateComponent("EC_RttTarget");
    rtt = cam.rtttarget;
    rtt.targettexture = camname + "_tex";
    rtt.size_x = 800;
    rtt.size_y = 600;
    rtt.PrepareRtt();
    rtt.SetAutoUpdated(true);

    return rtt;
}

function setImageSource(cam) {
    if (rtt != null) {
        rtt.SetAutoUpdated(false);
    }
    rtt = cam.rtttarget;
    rtt.SetAutoUpdated(true);

    var matname = rtt.targettexture + "_mat"; //XXX add mat name getter to EC_RttTarget
    me.mesh.SetMaterial(1, matname);

    print(me + " set to display rtt image via mat " + matname); // + " from " + cam);
}

/*function bindButton(camname, butname) {
    var but = scene.GetEntityByName(butname);
    var cam = scene.GetEntityByName(camname);

    but.Action("MousePress").Triggered.connect(
      function() {
        setImageSource(cam);
      });
}*/
function nextcam() {
    cameraidx++;
    var idx = cameraidx % cameralist.length;
    print(idx);
    var camname = cameralist[idx];
    var cam = scene.GetEntityByName(camname);
    setImageSource(cam);
}

function update(frametime) {
    var vis = renderer.IsEntityVisible(me.id);
    if(rtt != null) {
        rtt.SetAutoUpdated(vis);
        
        movingtargetcam();
    }
}

function movingtargetcam() {
    //copy paste from av app 3rd person cam, just an offset
    if (target == null) {    
        target = scene.GetEntityByName("Guard");
        if (target == null) {
            return; //fish game wasn't loaded yet
        }
        targetcam = scene.GetEntityByName("cam_rtt");
    }
    
    var targettransform = target.placeable.transform;
    var cameratransform = targetcam.placeable.transform;

    var offsetVec = new float3(0,0,0);
    offsetVec.x = -target_camera_distance;
    offsetVec.z = target_camera_height;
    offsetVec = target.placeable.LocalToWorld().MulDir(offsetVec);

    cameratransform.pos.x = targettransform.pos.x + offsetVec.x;
    cameratransform.pos.y = targettransform.pos.y + offsetVec.y;
    cameratransform.pos.z = targettransform.pos.z + offsetVec.z;

    // Note: this is not nice how we have to fudge the camera rotation to get it to show the right things
    cameratransform.rot.x = 90;
    cameratransform.rot.z = targettransform.rot.z - 90;

    targetcam.placeable.transform = cameratransform;
}

frame.DelayedExecute(0.1).Triggered.connect(this, init); //XXX dirty hack
frame.Updated.connect(update);

me.Action("MousePress").Triggered.connect(nextcam);
    
print("----");
