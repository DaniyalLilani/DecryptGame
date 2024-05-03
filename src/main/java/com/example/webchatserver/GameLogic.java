package com.example.webchatserver;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class GameLogic {
    private final Map<String, Integer> scores = new HashMap<>();
    private String currentCipher;

    private int offset;

    //private String[] decryptionMethod; may use later for a more complex approach
    private String realSolution;

    public GameLogic() {

        offset = 0;
        //randomWord();
        //EncryptCypher();

    }

    public String getBroadcast() {
        return "The new Cypher is: " + currentCipher;
    }

    public void randomWord(){
        Random random = new Random();
        final String[] words = {
                "example", "random", "solution", "encryption", "algorithm", "secure",
                "message", "cipher", "protocol", "decryption", "hashing", "privacy",
                "authentication", "integrity", "decipher", "encode", "decode", "data",
                "key", "blockchain", "digital", "signature", "token", "cybersecurity",
                "firewall", "anonymity", "compression", "binary", "quantum", "validation"
        };

        realSolution = words[random.nextInt(words.length)];
    }



   public boolean guess(String attempt){
       return attempt.equalsIgnoreCase(realSolution);
   }

    public void EncryptCypher() { //Aryan: Removed param and using realSolution instead

        Random random = new Random();
        int shiftNumber = random.nextInt(26) + 1;
        //shiftNumber = 2;
        StringBuilder result = new StringBuilder();
        for (char character : realSolution.toCharArray()) { //Aryan: Changed to realSolution
            if (character != ' ') {
                // use ascii to build out the new encrypted message
                int originalAlphabetPosition = character - 'A';
                //System.out.println("Original alphabet pos : "+originalAlphabetPosition);
                //originalAlphabetPosition = character;
                int newAlphabetPosition = (originalAlphabetPosition + shiftNumber) % 26;
                //System.out.println("new Alphabet pos : "+newAlphabetPosition);
                char newCharacter = (char) ('A' + newAlphabetPosition);
                //System.out.println("new char pos  : "+('A' + newAlphabetPosition));
                //System.out.println("new char : "+newCharacter);

                result.append(newCharacter);
            } else {
                result.append(character);
            }
        }
        offset = shiftNumber;
        currentCipher = result.toString();
        System.out.println("current cipher : "+currentCipher);
        System.out.println("real soln: "+realSolution);
        System.out.println("offset "+ offset);
    }

    public boolean attemptSolution(String username, String solution) {
        if (solution.equals(realSolution)) { // Not using ignoreCase, cyphers can be cap sensitive
            scores.merge(username, 1, Integer::sum);
            if (checkWinCondition(username)) {
                return true;
            } else {
//                EncryptCypher();  // Generate a new puzzle for the next round
                setNewQuestion(); //Aryan: creating a new solution and cypher
                return true;
            }
        }
        return false;
    }

    public void setNewQuestion() {
        randomWord();
        EncryptCypher();
    }

    public int getScore(String username) {
        return scores.getOrDefault(username, 0);
    }

    public String getCurrentCipherAndWord() {
        return currentCipher;
    }

    public boolean checkWinCondition(String username) {
        return scores.getOrDefault(username, 0) >= 5;
    }

}



