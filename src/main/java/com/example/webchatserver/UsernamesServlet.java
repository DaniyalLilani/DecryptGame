package com.example.webchatserver;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
@WebServlet("/usernames")
public class UsernamesServlet extends HttpServlet {
    private SharedContext sharedContext = SharedContext.getInstance();
    private Gson gson = new Gson(); // Added Gson to  dependencies

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
        response.setHeader("Access-Control-Allow-Methods", "GET"); // Allow only GET requests
        response.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Serialize the usernames map to JSON
        String usernamesJson = gson.toJson(sharedContext.getUsernames());
        out.println(usernamesJson);
        out.close();
    }
}
