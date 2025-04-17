package java;

public class UserService {
    
    public boolean login(String username, String password) {
        if (username.equals("admin") && password.equals("password")) {
            return true;
        }
        return false;
    }

    public String getUserRole(String username) {
        if (username.equals("admin")) {
            return "Administrator";
        } else {
            return "User";
        }
    }

    public void logout(String username) {
        System.out.println(username + " has been logged out.");
    }
}
