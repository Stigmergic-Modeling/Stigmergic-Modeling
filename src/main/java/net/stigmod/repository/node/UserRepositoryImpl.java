/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.repository.node;

import net.stigmod.domain.system.User;
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

/**
 * @author  Shijun Wang
 * @version 2016/03/11
 */
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
    public User register(String name, String mail, String password, String passwordRepeat) {
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
        User user = userRepository.save(new User(name, mail, password, User.SecurityRole.ROLE_USER));
        setUserInSession(user);
        return user;
    }

    void setUserInSession(User user) {
        SecurityContext context = SecurityContextHolder.getContext();
        StigmodUserDetails userDetails = new StigmodUserDetails(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, user.getPassword(), userDetails.getAuthorities());
        context.setAuthentication(authentication);
    }

    public Iterable<User> findByProperty(String propertyName, Object propertyValue) {
        return session.loadAll(User.class, new Filter(propertyName, propertyValue));
    }

    @Transactional
    public void updateUserInfo(String mail, String name, String location, String url) {
        User user = findByLogin(mail);  // 邮件不能更改，是标识用户的唯一字段
        user.setName(name);
        user.setLocation(location);
        user.setUrl(url);
        userRepository.save(user);
    }

}
