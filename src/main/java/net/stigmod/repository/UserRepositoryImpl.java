package net.stigmod.repository;

import net.stigmod.domain.User;
import net.stigmod.service.StigmodUserDetails;
import net.stigmod.service.StigmodUserDetailsService;
import org.neo4j.helpers.collection.IteratorUtil;
import org.neo4j.ogm.cypher.Filter;
import org.neo4j.ogm.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

//import org.springframework.stereotype.Repository;

/**
 * @author mh
 * @since 06.03.11
 */
//@Repository
public class UserRepositoryImpl implements StigmodUserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Session session;

    @Override
    public StigmodUserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        final User user = findByLogin(login);
        if (user == null) {
            throw new UsernameNotFoundException("Username not found: " + login);
        }
        return new StigmodUserDetails(user);
    }

    private User findByLogin(String login) {
        return IteratorUtil.firstOrNull(findByProperty("mail", login).iterator());
    }

    @Override
    public User getUserFromSession() {
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication authentication = context.getAuthentication();
        Object principal = authentication.getPrincipal();
        if (principal instanceof StigmodUserDetails) {
            StigmodUserDetails userDetails = (StigmodUserDetails) principal;
            return userDetails.getUser();
        }
        return null;
    }

    @Override
    @Transactional
    public User register(String mail, String password, String passwordRepeat) {
        User found = findByLogin(mail);
        if (found != null) {
            throw new RuntimeException("Email already taken: " + mail);
        }
        if (password == null || password.isEmpty()) {
            throw new RuntimeException("No password provided.");
        }
        if (passwordRepeat == null || passwordRepeat.isEmpty()) {
            throw new RuntimeException("No password-repeat provided.");
        }
        if (!password.equals(passwordRepeat)) {  // 判断两次输入的密码是否一致
            throw new RuntimeException("Passwords provided do not equal.");
        }
        User user = userRepository.save(new User(mail, password, User.SecurityRole.ROLE_USER));
        setUserInSession(user);
        return user;
    }

    void setUserInSession(User user) {
        SecurityContext context = SecurityContextHolder.getContext();
        StigmodUserDetails userDetails = new StigmodUserDetails(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, user.getPassword(), userDetails.getAuthorities());
        context.setAuthentication(authentication);
    }

//    @Override
//    @Transactional
//    public void addFriend(String friendLogin, final User user) {
//        User friend = findByLogin(friendLogin);
//        if (!user.equals(friend)) {
//            user.addFriend(friend);
//            userRepository.save(user);
//        }
//    }

    public Iterable<User> findByProperty(String propertyName, Object propertyValue) {
        return session.loadAll(User.class, new Filter(propertyName, propertyValue));
    }

}
