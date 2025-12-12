package com.flux.app; // <--- KEEP THIS LINE AS-IS

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Add a listener to re-apply full screen every time the window gains focus 
        getWindow().getDecorView().setOnSystemUiVisibilityChangeListener(visibility -> setImmersiveMode());
        
        // 2. Schedule the initial full-screen call to happen after the view is fully initialized
        getWindow().getDecorView().post(this::setImmersiveMode);
    }
    
    // Block external browsers from opening
    @Override
    public void startActivity(Intent intent) {
        // Only block ACTION_VIEW intents (browser/external app launches)
        if (intent.getAction() != null && intent.getAction().equals(Intent.ACTION_VIEW)) {
            // Silently block it
            return;
        }
        
        // Allow everything else
        super.startActivity(intent);
    }

    // Simplified and aggressive method using flags that force the view to stay hidden
    private void setImmersiveMode() {
        // Use the older flags which are more aggressive in forcing IMMERSIVE_STICKY
        // on both new and old Android versions for maximum compatibility and hiding.
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE 
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION      // Hides navbar
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY // This flag is key to fighting OS overrides
            | View.SYSTEM_UI_FLAG_FULLSCREEN           // Hides status bar
        );
        
        // Safety call for modern systems (though the flags above often override it)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            final WindowInsetsController insetsController = getWindow().getInsetsController();
            if (insetsController != null) {
                insetsController.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                insetsController.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        }
    }
}
