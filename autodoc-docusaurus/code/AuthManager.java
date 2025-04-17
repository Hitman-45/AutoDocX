package java;

public class AuthManager {

    private int activeSessions = 0;

    public void createSession(String username) {
        System.out.println("Session created for " + username);
        activeSessions++;
    }

    public void destroySession(String username) {
        System.out.println("Session destroyed for " + username);
        activeSessions--;
    }

    public int getActiveSessions() {
        return activeSessions;
    }
}
