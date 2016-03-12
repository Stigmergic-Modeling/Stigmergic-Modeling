/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.system.User;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author  Shijun Wang
 * @version 2016/03/11
 */
public interface StigmodUserDetailsService extends UserDetailsService {
    @Override
    StigmodUserDetails loadUserByUsername(String login) throws UsernameNotFoundException, DataAccessException;

    User getUserFromSession();

    @Transactional
    String register(String name, String mail, String password, String passwordRepeat);

    @Transactional
    String resendRegisterEmail(String verificationId);

    @Transactional
    User registerVerify(String verificationId);

    @Transactional
    String forgetPassword(String mail);

    @Transactional
    String resendResetPasswordEmail(String verificationId);

    @Transactional
    User resetPasswordVerify(String verificationId);

    @Transactional
    User resetPassword(String verificationId, String password, String passwordRepeat);

    @Transactional
    void updateUserInfo(String mail, String name, String location, String url);
}
