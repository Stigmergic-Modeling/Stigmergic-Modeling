/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.node.User;
import net.stigmod.repository.node.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * StigmodUserDetailsService
 *
 * @version     2015/11/11
 * @author      mh
 * @author 	    Shijun Wang
 */
@Service
public class StigmodUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

//    @Autowired
//    private Session session;

    public StigmodUserDetailsService() {}

    public StigmodUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public StigmodUserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
        final User user = userRepository.findByMail(mail);
        if (user == null) {
            throw new UsernameNotFoundException("Username not found: " + mail);
        }
        return new StigmodUserDetails(user);
    }

//    private User findByMail(String mail) {
//        return IteratorUtil.firstOrNull(findByProperty("mail", mail).iterator());
//    }

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

    @Transactional
    public User register(String mail, String password, String passwordRepeat) {
        User found = userRepository.findByMail(mail);
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
//    public void addFriend(String friendmail, final User user) {
//        User friend = findByMail(friendmail);
//        if (!user.equals(friend)) {
//            user.addFriend(friend);
//            userRepository.save(user);
//        }
//    }

//    public Iterable<User> findByProperty(String propertyName, Object propertyValue) {
//        return session.loadAll(User.class, new Filter(propertyName, propertyValue));
//    }

}

