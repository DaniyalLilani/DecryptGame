package com.example.webchatserver;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/cipher")
public class CipherServlet extends HttpServlet {
    private GameLogic gameLogic;

    @Override
    public void init() throws ServletException {
        super.init();
        // Initialize GameLogic here
        this.gameLogic = new GameLogic();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setContentType("text/plain");
        resp.setCharacterEncoding("UTF-8");
        // Retrieve the current cipher
        gameLogic.setNewQuestion();
        String currentCipher = gameLogic.getCurrentCipherAndWord();
        resp.getWriter().write(currentCipher);
    }
}
