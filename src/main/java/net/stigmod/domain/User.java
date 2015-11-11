/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
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
 * @version     2015/11/11
 * @author 	    Shijun Wang
 */
@NodeEntity(label = "User")
public class User {
    private static final String SALT = "cewuiqwzie";

    @GraphId
    private Long id;

    // A user owns many ICMs
    @Relationship(type = "OWNS", direction = Relationship.INCOMING)
    private Set<UserToIcmEdge> u2iEdges =new HashSet<>();

    private String mail;
    private String password;

    @Convert(UserRolesConverter.class)
    private SecurityRole[] roles;

    public User() {}

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

    @Override
    public String toString() {
        return String.format("%s", mail);
    }
//
//    public String getName() {
//        return mail;
//    }
//
//    public void setName(String mail) {
//        this.mail = mail;
//    }

    public SecurityRole[] getRole() {
        return roles;
    }

//    public String getLogin() {
//        return mail;
//    }
//
//    public String getPassword() {
//        return password;
//    }

    public void updatePassword(String old, String newPass1, String newPass2) {
        if (!password.equals(encode(old))) {
            throw new IllegalArgumentException("Existing Password invalid");
        }
        if (!newPass1.equals(newPass2)) {
            throw new IllegalArgumentException("New Passwords don't match");
        }
        this.password = encode(newPass1);
    }

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


    // Getters & setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<UserToIcmEdge> getU2iEdges() {
        return u2iEdges;
    }

    public void setU2iEdges(Set<UserToIcmEdge> u2iEdges) {
        this.u2iEdges = u2iEdges;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
