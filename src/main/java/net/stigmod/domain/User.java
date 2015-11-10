/*
 * Copyright 2014-2016, Stigmergic-Modeling Project,
 * SEIDR, Peking University,
 * All rights reserved.
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain;

import net.stigmod.converter.UserRolesConverter;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Relationship;
import org.neo4j.ogm.annotation.typeconversion.Convert;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;

import java.util.HashSet;
import java.util.Set;

/**
 * User object
 *
 * @version     2015/08/11
 * @author 	    Shijun Wang
 */
@NodeEntity
public class User {
//    public static final String FRIEND = "FRIEND";
//    public static final String RATED = "RATED";
    private static final String SALT = "cewuiqwzie";
    @GraphId
    Long nodeId;
//    String login;
//    String name;
    String mail;
    String password;
    String info;

//    @Relationship(type = FRIEND, direction = Relationship.UNDIRECTED)
//    Set<User> friends = new HashSet<>();

    @Convert(UserRolesConverter.class)
    private SecurityRole[] roles;

//    @Relationship(type = "RATED")
//    private Set<Rating> ratings = new HashSet<>();

    public User() {
    }

    public User(String mail, String password) {
        this.mail = mail;
        this.password = password;
    }

    public User(String mail, String password, SecurityRole... roles) {
        this.mail = mail;
        this.password = encode(password);
        this.roles = roles;
    }

    private String encode(String password) {
        return new Md5PasswordEncoder().encodePassword(password, SALT);
    }


//    public void addFriend(User friend) {
//        this.friends.add(friend);
//    }

//    public Rating rate(Movie movie, int stars, String comment) {
//        if (ratings == null) {
//            ratings = new HashSet<>();
//        }
//
//        Rating rating = new Rating(this, movie, stars, comment);
//        ratings.add(rating);
//        movie.addRating(rating);
//        return rating;
//    }
//
//    public Set<Rating> getRatings() {
//        return ratings;
//    }

    @Override
    public String toString() {
        return String.format("%s", mail);
    }

    public String getName() {
        return mail;
    }

    public void setName(String mail) {
        this.mail = mail;
    }

//    public Set<User> getFriends() {
//        return friends;
//    }

    public SecurityRole[] getRole() {
        return roles;
    }

    public String getLogin() {
        return mail;
    }

    public String getPassword() {
        return password;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }

    public void updatePassword(String old, String newPass1, String newPass2) {
        if (!password.equals(encode(old))) {
            throw new IllegalArgumentException("Existing Password invalid");
        }
        if (!newPass1.equals(newPass2)) {
            throw new IllegalArgumentException("New Passwords don't match");
        }
        this.password = encode(newPass1);
    }

//    public boolean isFriend(User other) {
//        return other != null && getFriends().contains(other);
//    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof User)) {
            return false;
        }

        User user = (User) o;

        return mail == null ? user.mail == null : mail.equals(user.mail);
    }

    @Override
    public int hashCode() {
        return mail != null ? mail.hashCode() : 0;
    }

    public enum SecurityRole implements GrantedAuthority {
        ROLE_USER, ROLE_ADMIN;

        @Override
        public String getAuthority() {
            return name();
        }
    }
}
