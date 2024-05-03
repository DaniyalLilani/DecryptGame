package com.example.webchatserver;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
public class SharedContext {
    private static final SharedContext instance = new SharedContext();
    private Map<String, String> usernames = new HashMap<>();

    private SharedContext() {
    }

    public static SharedContext getInstance() {
        return instance;
    }

    public Map<String, String> getUsernames() {
        return usernames;
    }
}

