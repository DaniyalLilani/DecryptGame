package com.example.webchatserver;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class represents the data you may need to store about a Chat room
 * You may add more method or attributes as needed
 * **/
public class ChatRoom {
    private String code;

    //each user has an unique ID associate to their ws session and their username
    private Map<String, String> users = new HashMap<String, String>() ;

    // when created the chat room has at least one user
    public ChatRoom(String code, String user){
        this.code = code;
        // when created the user has not entered their username yet
        this.users.put(user, "");
    }
    public void setCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public Map<String, String> getUsers() {
        return users;
    }

    /**
     * This method will add the new userID to the room if not exists, or it will add a new userID,name pair
     * **/
    public void setUserName(String userID, String name) {
        // update the name
        if(users.containsKey(userID)){
            users.replace(userID, name);
//            users.remove(userID);
//            users.put(userID, name); //Aryan: above line should be doing same thing
        } else { // add new user
            users.put(userID, name);
        }
    }

    /**
     * This method will remove a user from this room
     * **/
    public void removeUser(String userID){
//        if(users.containsKey(userID)){ //Aryan: Doesn't seem necessary
        users.remove(userID);
//        }

    }

    public boolean inRoom(String userID){
        return users.containsKey(userID);
    }
}
