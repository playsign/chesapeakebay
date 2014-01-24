engine.ImportExtension("qt.core");
engine.ImportExtension("qt.gui");

// !ref: main_right_panel.ui
// !ref: game_choice.ui

var hudRightPanel_ = null;
var hudGamePanel_ = null;
var hudGamePanelProxy_ = null;

keep = [];

function CreateMainRightPanel() {  
    var file = "main_right_panel.ui";
    hudRightPanel_ = ui.LoadFromFile(file, false);
    if (hudRightPanel_ == null) {
        print("MainHud.js: LoadFromFile ui-file:" + file + " failed.");
        return;
    }

    //print(hudRightPanel_);
    //hudRightPanel_.show();
    //keep.gui = hudRightPanel_;
    
        var proxy = ui.AddWidgetToScene(hudRightPanel_);

        // No window borders.
        proxy.windowFlags = 0;

        var gscene = ui.GraphicsScene();
        gscene.sceneRectChanged.connect(OnWindowSizeChanged);
        //hudRightPanel_.resize(154, 300);
        hudRightPanel_.move(gscene.width() - hudRightPanel_.width, gscene.height() - hudRightPanel_.height - 10);
    print("MainHud trying to show");
    print(proxy);
    proxy.visible = true;

    var butGames = findChild(hudRightPanel_, "butGames");
    if (butGames == null) {
        print("MainHud.js: Did not find games icon");
        return;
    }
       
    butGames.clicked.connect(ShowGamesPanel);
}

function ShowGamesPanel() {    
    if (hudGamePanel_ == null) {
        var location = "game_choice.ui";
        hudGamePanel_ = ui.LoadFromFile(location, false);
        if (hudGamePanel_ == null) {
            print("MainHud.js: LoadFromFile ui-file:" + file + " failed.");
            return;
        }
        hudGamePanelProxy_ = ui.AddWidgetToScene(hudGamePanel_);

        // No window borders.
        hudGamePanelProxy_.windowFlags = 0;

        var startOsprey = findChild(hudGamePanel_, "startOsprey");
        if (startOsprey == null) {
            print("MainHud.js: Did not find games osprey icon");
            return;
        }

        startOsprey.clicked.connect(StartOspreyGame);

        var startFish = findChild(hudGamePanel_, "startFish");
        if (startOsprey == null) {
            print("MainHud.js: Did not find games fish icon");
            return;
        }

        startFish.clicked.connect(StartFishGame);
        
        var gscene = ui.GraphicsScene();
        gscene.sceneRectChanged.connect(OnWindowSizeChanged);
        //hudRightPanel_.resize(154, 300);
        hudGamePanel_.move(gscene.width() / 2.0 -  hudGamePanel_.width / 2.0, gscene.height() / 2.0 -  hudGamePanel_.height/ 2.0);
        hudGamePanelProxy_.visible = true;
        
    }
    else {
        var gscene = ui.GraphicsScene();   
        hudGamePanel_.move(gscene.width() / 2.0 -  hudGamePanel_.width / 2.0, gscene.height() / 2.0 -  hudGamePanel_.height/ 2.0);
        hudGamePanelProxy_.visible = true;
    }

}

function OnWindowSizeChanged() {

    if (hudRightPanel_ != null) {
        var gscene = ui.GraphicsScene();
        hudRightPanel_.move(gscene.width() - hudRightPanel_.width, gscene.height() - hudRightPanel_.height - 10);
    }

    if (hudGamePanel_ != null && hudGamePanel_.visible == true) {
        var gscene = ui.GraphicsScene();
        hudGamePanel_.move(gscene.width() / 2.0 -  hudGamePanel_.width / 2.0, gscene.height() / 2.0 -  hudGamePanel_.height/ 2.0);
    }

}




/// Assumes that all ui components are created.
function ShowMainUI() {

    ShowMainRightPanel();
    ShowChatPanel();
}

function ShowMainUIOnClient(id) {
    if (!server.IsRunning() ) {
        if (client.GetConnectionID() == id) {
            ShowMainUI();
        } 
       
    }
}

function HideMainUI() {
    
    HideMainRightPanel();
    HideChatPanel();
    
}

function HideMainRightPanel() {
    
    if (hudRightPanel_ != null) {
        hudRightPanel_.hide();
    }
}

function HideChatPanel() {
    var e = scene.GetEntityByName("ChatApplication");
    if(e)
        e.Exec(1, "HideChat");
}

function ShowChatPanel() {
    var e = scene.GetEntityByName("ChatApplication");
    if (e) {
        e.Exec(1, "ShowChat");
    }
}

function StartOspreyGame() {
    var e = scene.GetEntityByName("OspreyLauncher");
    e.Exec(1, "ShowControls");
    hudGamePanelProxy_.visible = false;
}

function StartFishGame() {
    var e  = scene.GetEntityByName("FishGame");
    e.Exec(2, "LaunchGame");

    hudGamePanelProxy_.visible = !hudGamePanelProxy_.visible;

    HideMainUI();
}


/// Assumes that right panel ui is created.
function ShowMainRightPanel() {
    
    if (hudRightPanel_ != null) {
        hudRightPanel_.show();
    }
}

me.Action("ShowMainUI").Triggered.connect(ShowMainUI);
me.Action("HideMainUI").Triggered.connect(HideMainUI);
me.Action("ShowMainUIOnClient").Triggered.connect(ShowMainUIOnClient);

// Main right panel controls.
//me.Action("CreateMainRightPanel").Triggered.connect(CreateMainRightPanel);
me.Action("ShowMainRightPanel").Triggered.connect(ShowMainRightPanel);
me.Action("HideMainRightPanel").Triggered.connect(HideMainRightPanel);

// Chat, these actions are transformed existing chat application (if there exist any)
me.Action("HideChatPanel").Triggered.connect(HideChatPanel);
me.Action("ShowChatPanel").Triggered.connect(ShowChatPanel);

// Ok we are ready create ui
if (server.IsRunning() == false) {
    CreateMainRightPanel();
}
