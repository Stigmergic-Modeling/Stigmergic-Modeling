/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.domain.system;

import net.stigmod.converter.UserRolesConverter;
import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Relationship;
import org.neo4j.ogm.annotation.typeconversion.Convert;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * User object
 *
 * @version     2016/02/03
 * @author 	    Shijun Wang
 */
@NodeEntity(label = "User")
public class User {
    private static final String SALT = "cewuiqwzie";

    @GraphId
    private Long id;

    // A user owns many ICMs
    @Relationship(type = "OWNS", direction = Relationship.OUTGOING)
    private Set<IndividualConceptualModel> icms = new HashSet<>();

    private String mail;
    private String password;
    private String name;
    private String url = "";
    private String location = "";
    private Date signUpDate;

    @Convert(UserRolesConverter.class)
    private SecurityRole[] roles;

    private String verificationId = "";

    public User() {}

    public User(String name, String mail, String password) {
        this.name = name;
        this.mail = mail;
        this.password = this.encode(password);
        this.signUpDate = new Date();
    }

    public User(String name, String mail, String password, SecurityRole... roles) {
        this.name = name;
        this.mail = mail;
        this.password = this.encode(password);
        this.roles = roles;
        this.signUpDate = new Date();
    }

    private String encode(String password) {
        return new Md5PasswordEncoder().encodePassword(password, SALT);
    }

    @Override
    public String toString() {
        return String.format("%s", mail);
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

    /**
     * 增加 ICM 与该 User 的关联
     * @param icm ICM
     */
    public void addIcm(IndividualConceptualModel icm) {
        this.icms.add(icm);
    }

    /**
     * 删除 ICM 与该 User 的关联
     * @param icm ICM
     */
    public void removeIcm(IndividualConceptualModel icm) {
        this.icms.remove(icm);
    }

    /**
     * 重置 Verification ID
     */
    public String resetVerificationId() {
        String verificationId = this.generateVerificationId();
        this.verificationId = verificationId;
        return verificationId;
    }

    /**
     * 生成 Verification ID
     * @return Verification ID
     */
    private String generateVerificationId() {
        return this.encode(this.getMail() + new Date().toString());
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
        ROLE_USER, ROLE_USER_TOBE, ROLE_ADMIN;

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

    public SecurityRole[] getRoles() {
        return roles;
    }

    public void setRoles(SecurityRole[] roles) {
        this.roles = roles;
    }

    public String getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(String verificationId) {
        this.verificationId = verificationId;
    }

    public Set<IndividualConceptualModel> getIcms() {
        return icms;
    }

    public void setIcms(Set<IndividualConceptualModel> icms) {
        this.icms = icms;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Date getSignUpDate() {
        return signUpDate;
    }

    public void setSignUpDate(Date signUpDate) {
        this.signUpDate = signUpDate;
    }
}
