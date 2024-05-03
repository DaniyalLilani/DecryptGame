package com.example.webchatserver;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    // contains a static List of ChatRoom used to control the existing rooms and their users
    private static Map<String, String> roomList = new HashMap<String, String>();
    private SharedContext sharedContext = SharedContext.getInstance();
    // you may add other attributes as you see fit
    private static Map<String, GameLogic> roomGames = new HashMap<>();
    private static String player1 = null;
    private static String player2 = null;
    private static int player1_score = 0;
    private static int player2_score = 0;

    @OnOpen
    public void open(@PathParam("roomID") String roomID, Session session) throws IOException, EncodeException {
        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome to the chat room. Please state your username to begin.\"}");
        // accessing the roomID parameter
        roomList.put(session.getId(), roomID);//Adding User to the room
        roomGames.putIfAbsent(roomID, new GameLogic());
        System.out.println(roomID);
    }



    @OnClose
    public void close(@PathParam("roomID") String roomID, Session session) throws IOException {
        player1_score =0;
        player2_score=0;

        String userId = session.getId();
        String username = sharedContext.getUsernames().get(userId);
        if (!(username == null)) {
            sharedContext.getUsernames().remove(userId);
            broadcastToRoomExcept(session, roomID, "{\"type\": \"chat\", \"message\":\"(Server): " + username + " left the chat room." + "\"}");
        }
    }

    @OnMessage
    public void onMessage(Session session, String message, @PathParam("roomID") String roomID) {
        try (JsonReader jsonReader = Json.createReader(new StringReader(message))) {
            JsonObject jsonMessage = jsonReader.readObject();
            String type = jsonMessage.getString("type");

            switch (type) {
                case "set-username":
                    handleSetUsername(session, jsonMessage, roomID);
                    break;
                case "chat":
                    handleCipherGuess(session, jsonMessage, roomID);
                    break;
                case "request-start-round":
                    handleStartRound(session, roomID);
                    break;
                case "get-session":
                    getSession(session);
                    break;
                default:
                    handleUnknownType(session, type);
                    break;
            }
        } catch(Exception e){
            System.err.println("Error parsing JSON message: " + e.getMessage());
        }
    }
    private void assignPlayers(String roomID) {
        List<String> usernames = new ArrayList<>(sharedContext.getUsernames().values());
        if (usernames.size() >= 2) {
            player1 = usernames.get(0);
            player2 = usernames.get(1);
            System.out.println("Player 1: " + player1 + ", Player 2: " + player2);
        }
        else
        {
            player1 = usernames.get(0);
        }
    }

    private void getSession(Session session) throws IOException {
            String roomId = roomList.get(session.getId());

            for (Session peer : session.getOpenSessions()) {
                if (roomList.get(peer.getId()).equals(roomId) )
                {
                    peer.getBasicRemote().sendText("{\"type\": \"get-session\", \"message\": \"Session ID: " + session.getId() + "\"}");
                }
            }
        }
    private void handleCipherGuess(Session session, JsonObject jsonMessage, String roomID) throws IOException {
        String guess = jsonMessage.getString("msg");
        GameLogic gameLogic = roomGames.get(roomID);
        String userId = session.getId();
        String username = sharedContext.getUsernames().get(userId);
        boolean isCorrect = gameLogic.guess(guess);
        if (isCorrect) {

            if(username == player1)
            {
                player1_score++;
            }
            else
            {
                player2_score++;
            }

            if(player1_score == 5)
            {
                handleChat(session, jsonMessage, roomID);
                broadcastToRoom(session,roomID, "{\"type\": \"chat\", \"message\":\"(Server): "+player1+" wins!"+"\"}");
                broadcastToRoom(session, roomID, "{\"type\": \"score\", \"message\":\"" + player1 + ": " + player1_score + " | " + player2 + ": " + player2_score + "\"}");
                broadcastToRoom(session,roomID, "{\"type\": \"endgame\"}");
            }
            else if (player2_score == 5)
            {
                handleChat(session, jsonMessage, roomID);
                broadcastToRoom(session,roomID, "{\"type\": \"chat\", \"message\":\"(Server): "+player2+" wins!"+"\"}");
                broadcastToRoom(session, roomID, "{\"type\": \"score\", \"message\":\"" + player1 + ": " + player1_score + " | " + player2 + ": " + player2_score + "\"}");
                broadcastToRoom(session,roomID, "{\"type\": \"endgame\"}");


            }
            else {
                handleChat(session, jsonMessage, roomID);
                broadcastToRoom(session, roomID, "{\"type\": \"score\", \"message\":\"" + player1 + ": " + player1_score + " | " + player2 + ": " + player2_score + "\"}");
                handleStartRound(session, roomID);
            }



            // Optionally, start a new round or handle the end-game scenario here.
        }
        else {
            //broadcastToRoom(session,roomID, "{\"type\": \"chat\", \"message\":\"(Server):" + "1" +isCorrect + " \"}");

            handleChat(session,jsonMessage,roomID);

        }
    }


    private void handleSetUsername(Session session, JsonObject jsonMessage, String roomID) throws IOException {
        String username = jsonMessage.getString("username");
        sharedContext.getUsernames().put(session.getId(), username);
        broadcastToRoomExcept(session, roomID, "{\"type\": \"chat\", \"message\":\"(Server): " + username + " joined the chat room." + "\"}");
        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome to the chat room, " + username + "!\"}");
    }

    private void handleChat(Session session, JsonObject jsonMessage, String roomID) throws IOException {
        //session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + sharedContext.getUsernames().get(session.getId()) + "): " + jsonMessage.getString("msg") + " \"}");
//
//      sendMessage(session, jsonMessage.getString("msg"));
        ///String message = jsonMessage.getString("msg");

        broadcastToRoom(session,roomID, "{\"type\": \"chat\", \"message\":\"(" + sharedContext.getUsernames().get(session.getId()) + "): " + jsonMessage.getString("msg") + " \"}");
    }

    private void handleStartRound(Session session, String roomID) {
        GameLogic gameLogic = roomGames.get(roomID);
        gameLogic.setNewQuestion();
        assignPlayers(roomID);
        broadcastToRoom(session, roomID, "{\"type\": \"score\", \"message\":\"" + player1 + ": " + player1_score + " | " + player2 + ": " + player2_score + "\"}");

        JsonObject response = Json.createObjectBuilder()
                .add("type", "start-round")
                .add("newCipher", gameLogic.getCurrentCipherAndWord())
                .build();
        broadcastToRoom(session,roomID, response.toString());
    }

    private void handleUnknownType(Session session, String type) {
        sendMessage(session, "Unknown message type: " + type);
    }


    private void broadcastToRoomExcept(Session sender, String roomID, String message) {
        String senderId = sender.getId();
        sender.getOpenSessions().stream()
                .filter(s -> roomID.equals(roomList.get(s.getId())) &&!s.getId().equals(senderId))
                .forEach(s -> s.getAsyncRemote().sendText(message));
    }

    private void broadcastToRoom(Session session, String roomID, String message) {
        for (Session s : session.getOpenSessions()) {
            if (roomID.equals(roomList.get(s.getId()))) {
                s.getAsyncRemote().sendText(message);
            }
        }
    }


    /*private void handleChatMessage(Session session, String roomID, String message) {
        String username = sharedContext.getUsernames().get(session.getId());
        String correctRoomID = roomList.get(session.getId());
        broadcastToRoom(session, correctRoomID, session.getId(), username + ": " + message, false);
    }*/


    private void sendMessage(Session session, String message) {
        session.getAsyncRemote().sendText(Json.createObjectBuilder()
                .add("type", "chat")
                .add("message", message)
                .build().toString());
    }

}