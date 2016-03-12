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
import net.stigmod.service.MailService;
import net.stigmod.service.StigmodUserDetails;
import net.stigmod.service.StigmodUserDetailsService;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
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

import java.util.Arrays;

/**
 * @author  Shijun Wang
 * @version 2016/03/11
 */
public class UserRepositoryImpl implements StigmodUserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Session session;

    @Autowired
    private MailService mailService;

    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

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

    /**
     * 处理用户注册行为，发送验证邮件
     * @param name 用户名
     * @param mail 用户邮件地址
     * @param password 用户密码
     * @param passwordRepeat 用户密码（重复）
     * @return 验证 ID
     */
    @Override
    @Transactional
    public String register(String name, String mail, String password, String passwordRepeat) {
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

        // 生成待验证用户节点
        User user = new User(name, mail, password, User.SecurityRole.ROLE_USER_TOBE);
        String verificationId = user.resetVerificationId();
        userRepository.save(user);

        // 发送验证邮件
        this.sendSignupActivationEmail(mail, name, verificationId);

        return verificationId;
    }

    /**
     * 重新发送注册确认邮件（激活连接会更新）
     * @param verificationId V ID
     * @return 新的 V ID
     */
    @Transactional
    public String resendRegisterEmail(String verificationId) {

        User user = userRepository.findByVerificationId(verificationId);
        if (user != null && Arrays.asList(user.getRoles()).contains(User.SecurityRole.ROLE_USER_TOBE)) {

            String newVerId = user.resetVerificationId();  // 更新 Verification ID
            userRepository.save(user);
            this.sendSignupActivationEmail(user.getMail(), user.getName(), verificationId);  // 发送验证邮件
            return newVerId;

        } else {
            throw new UsernameNotFoundException("User does not exist or have already been activated.");
        }
    }

    /**
     * 发送注册验证邮件
     * @param mail 邮件地址
     * @param name 用户名
     * @param verificationId 如其名哈
     */
    private void sendSignupActivationEmail(String mail, String name, String verificationId) {
        String verificationLink = "http://" + host + ":" + port + "/signup/verify?id=" + verificationId;
        String subject = "Stigmergic-Modeling signup confirmation";
        String content = "<div style=\"background-color: #f0f8fa\">\n" +
                "    <center>\n" +
                "        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" style=\"background-color:#f0f8fa\">\n" +
                "            <tbody>\n" +
                "                <tr>\n" +
                "                    <td align=\"center\" valign=\"top\" style=\"padding:38px 18px\">\n" +
                "                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:600px\">\n" +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td align=\"center\" valign=\"top\">\n" +
                "                                        <a style=\"text-decoration:none; color:#20beff; font-size:30px\" href=\"https://stigmergic-modeling.net\" target=\"_blank\">\n" +
                "                                            Stigmergic-Modeling\n" +
                "                                        </a>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                                <tr>\n" +
                "                                    <td align=\"center\" valign=\"top\" style=\"padding-top:30px;padding-bottom:30px\">\n" +
                "                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#ffffff;border-collapse:separate!important;border-radius:4px\">\n" +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td align=\"center\" valign=\"top\" style=\"padding-top:30px;padding-bottom:30px\">\n" +
                "                                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#ffffff;border-collapse:separate!important;border-radius:4px\">\n" +
                "                                                            <tbody><tr>\n" +
                "                                                                <td align=\"center\" valign=\"top\">\n" +
                "                                                                    <h1 style=\"padding:38px 0 12px; margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans; font-size:38px\">Welcome!</h1>\n" +
                "                                                                    <h3 style=\"font-family:'Helvetica Neue', Helvetica, Arial, sans; font-size:16px; font-weight:normal; line-height:1.5; padding:0;\">Your Stigmergic-Modeling account (" + name + ") has been created.<br>Click below to activate it:</h3>\n" +
                "                                                                </td>\n" +
                "                                                            </tr>\n" +
                "                                                            <tr>\n" +
                "                                                                <td align=\"center\" valign=\"middle\" style=\"padding-right:40px;padding-bottom:40px;padding-left:40px\">\n" +
                "                                                                    <table border=\"0\" cellpadding=\"10\" cellspacing=\"0\" style=\"background-color:#2799c8;border-collapse:separate!important;border-radius:3px\">\n" +
                "                                                                        <tbody><tr>\n" +
                "                                                                            <td align=\"center\" valign=\"middle\">\n" +
                "                                                                                <a href=\"" + verificationLink + "\" style=\"color:#ddd; text-decoration:none; padding:22px 28px; font-size:28px; font-family:'Helvetica Neue', Helvetica, Arial, sans; \" target=\"_blank\">Activate</a>\n" +
                "                                                                            </td>\n" +
                "                                                                        </tr>\n" +
                "                                                                    </tbody></table>\n" +
                "                                                                </td>\n" +
                "                                                            </tr>\n" +
                "                                                            <tr>\n" +
                "                                                                <td align=\"center\">\n" +
                "                                                                    <span style=\"font-size:0.75em\">Alternatively, paste this into your browser:<br>\n" +
                "                                                                        <a href=\"" + verificationLink + "\" target=\"_blank\">" + verificationLink + "</a></span>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody></table>\n" +
                "                                                        </td>\n" +
                "                                                    </tr>\n" +
                "                                                </tbody>\n" +
                "                                            </table>\n" +
                "                                        </td>\n" +
                "                                    </tr>\n" +
                "                                    <tr>\n" +
                "                                        <td align=\"center\" valign=\"top\">\n" +
                "                                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
                "                                                <tbody><tr>\n" +
                "                                                 <td align=\"center\" valign=\"top\" style=\"font-family:'Helvetica Neue', helvetica, sans; font-size:14px; line-height:1.5\">\n" +
                "                                                     &copy; 2016 Stigmergic-Modeling\n" +
                "                                                 </td>\n" +
                "                                             </tr>\n" +
                "                                         </tbody></table>\n" +
                "                                     </td>\n" +
                "                                 </tr>\n" +
                "                             </tbody>\n" +
                "                         </table>\n" +
                "                     </td>\n" +
                "                 </tr>\n" +
                "             </tbody>\n" +
                "         </table>\n" +
                "     </center>\n" +
                " </div>";
        mailService.sendEmail(mail, subject, content);
    }

    /**
     * 注册验证，并登录
     * @param verificationId 验证 ID
     * @return 验证好并已登录的用户对象
     */
    @Transactional
    public User registerVerify(String verificationId) throws UsernameNotFoundException {
        User user = userRepository.findByVerificationId(verificationId);
        if (user != null && Arrays.asList(user.getRoles()).contains(User.SecurityRole.ROLE_USER_TOBE)) {
            User.SecurityRole[] roles = {User.SecurityRole.ROLE_USER};
            user.setRoles(roles);
            userRepository.save(user);
            setUserInSession(user);
            return user;
        } else {
            throw new UsernameNotFoundException("User does not exist or have already been activated.");
        }
    }

    /**
     * 处理用户找回密码行为，并发送确认重置密码邮件
     * @param mail 用户邮件地址
     * @return 用户的新 Verification ID （即本次所发送邮件中所包含的 ID）
     */
    @Transactional
    public String forgetPassword(String mail) {
        User user = userRepository.findByMail(mail);
        if (user != null && Arrays.asList(user.getRoles()).contains(User.SecurityRole.ROLE_USER)) {
            String newVerId = user.resetVerificationId();  // 更新 Verification ID
            userRepository.save(user);
            this.sendResetPasswordEmail(mail, user.getName(), newVerId);
            return newVerId;
        } else {
            throw new UsernameNotFoundException("User does not exist or have already been activated.");
        }
    }

    /**
     * 发送重置密码（忘记密码）验证邮件
     * @param mail 邮件地址
     * @param name 用户名
     * @param verificationId 如其名哈
     */
    private void sendResetPasswordEmail(String mail, String name, String verificationId) {
        String verificationLink = "http://" + host + ":" + port + "/forget/verify?id=" + verificationId;
        String subject = "Stigmergic-Modeling password reset confirmation";
        String content = "<div style=\"background-color: #f0f8fa\">\n" +
                "    <center>\n" +
                "        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" style=\"background-color:#f0f8fa\">\n" +
                "            <tbody>\n" +
                "                <tr>\n" +
                "                    <td align=\"center\" valign=\"top\" style=\"padding:38px 18px\">\n" +
                "                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:600px\">\n" +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td align=\"center\" valign=\"top\">\n" +
                "                                        <a style=\"text-decoration:none; color:#20beff; font-size:30px\" href=\"https://stigmergic-modeling.net\" target=\"_blank\">\n" +
                "                                            Stigmergic-Modeling\n" +
                "                                        </a>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                                <tr>\n" +
                "                                    <td align=\"center\" valign=\"top\" style=\"padding-top:30px;padding-bottom:30px\">\n" +
                "                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#ffffff;border-collapse:separate!important;border-radius:4px\">\n" +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td align=\"center\" valign=\"top\" style=\"padding-top:30px;padding-bottom:30px\">\n" +
                "                                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#ffffff;border-collapse:separate!important;border-radius:4px\">\n" +
                "                                                            <tbody><tr>\n" +
                "                                                                <td align=\"center\" valign=\"top\">\n" +
                "                                                                    <h1 style=\"padding:38px 0 12px; margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans; font-size:38px\">Welcome back!</h1>\n" +
                "                                                                    <h3 style=\"font-family:'Helvetica Neue', Helvetica, Arial, sans; font-size:16px; font-weight:normal; line-height:1.5; padding:0;\">Your are resetting the password of Stigmergic-Modeling account (" + name + ").<br>Click below to reset it:</h3>\n" +
                "                                                                </td>\n" +
                "                                                            </tr>\n" +
                "                                                            <tr>\n" +
                "                                                                <td align=\"center\" valign=\"middle\" style=\"padding-right:40px;padding-bottom:40px;padding-left:40px\">\n" +
                "                                                                    <table border=\"0\" cellpadding=\"10\" cellspacing=\"0\" style=\"background-color:#2799c8;border-collapse:separate!important;border-radius:3px\">\n" +
                "                                                                        <tbody><tr>\n" +
                "                                                                            <td align=\"center\" valign=\"middle\">\n" +
                "                                                                                <a href=\"" + verificationLink + "\" style=\"color:#ddd; text-decoration:none; padding:22px 28px; font-size:28px; font-family:'Helvetica Neue', Helvetica, Arial, sans; \" target=\"_blank\">Reset Password</a>\n" +
                "                                                                            </td>\n" +
                "                                                                        </tr>\n" +
                "                                                                    </tbody></table>\n" +
                "                                                                </td>\n" +
                "                                                            </tr>\n" +
                "                                                            <tr>\n" +
                "                                                                <td align=\"center\">\n" +
                "                                                                    <span style=\"font-size:0.75em\">Alternatively, paste this into your browser:<br>\n" +
                "                                                                        <a href=\"" + verificationLink + "\" target=\"_blank\">" + verificationLink + "</a></span>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody></table>\n" +
                "                                                        </td>\n" +
                "                                                    </tr>\n" +
                "                                                </tbody>\n" +
                "                                            </table>\n" +
                "                                        </td>\n" +
                "                                    </tr>\n" +
                "                                    <tr>\n" +
                "                                        <td align=\"center\" valign=\"top\">\n" +
                "                                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
                "                                                <tbody><tr>\n" +
                "                                                 <td align=\"center\" valign=\"top\" style=\"font-family:'Helvetica Neue', helvetica, sans; font-size:14px; line-height:1.5\">\n" +
                "                                                     &copy; 2016 Stigmergic-Modeling\n" +
                "                                                 </td>\n" +
                "                                             </tr>\n" +
                "                                         </tbody></table>\n" +
                "                                     </td>\n" +
                "                                 </tr>\n" +
                "                             </tbody>\n" +
                "                         </table>\n" +
                "                     </td>\n" +
                "                 </tr>\n" +
                "             </tbody>\n" +
                "         </table>\n" +
                "     </center>\n" +
                " </div>";
        mailService.sendEmail(mail, subject, content);
    }

    /**
     * 验证重置密码请求的有效性
     * @param verificationId 用户此时的 Verification ID
     * @return User 对象
     * @throws UsernameNotFoundException
     */
    @Transactional
    public User resetPasswordVerify(String verificationId) throws UsernameNotFoundException {
        User user = userRepository.findByVerificationId(verificationId);
        if (user != null && Arrays.asList(user.getRoles()).contains(User.SecurityRole.ROLE_USER)) {
            return user;
        } else {
            throw new UsernameNotFoundException("User does not exist.");
        }
    }

    /**
     * 重置密码
     * @param verificationId 用户此时的 Verification ID
     * @param password 用户的新密码
     * @param passwordRepeat 用户的新密码（重复）
     * @throws UsernameNotFoundException
     */
    @Transactional
    public User resetPassword(String verificationId, String password, String passwordRepeat) throws UsernameNotFoundException {
        User user = userRepository.findByVerificationId(verificationId);
        if (user == null || !Arrays.asList(user.getRoles()).contains(User.SecurityRole.ROLE_USER)) {
            throw new UsernameNotFoundException("User does not exist or the password resetting confirmation has expired.");
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
        user.setEncodedPassword(password);  // 更改密码
        user.resetVerificationId();  // 重置 VID，防止改密码连接被反复使用
        userRepository.save(user);
//        this.setUserInSession(user);  // 修改密码后不自动登录，而是要用户重新登录下。这样效果比较好。
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
