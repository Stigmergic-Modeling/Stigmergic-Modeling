/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import net.stigmod.util.config.MailServer;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * @author Shijun Wang
 * @version 2016/3/12
 */
@Service
public class MailService {

    // 获取配置文件中的邮件服务相关信息（/src/main/resources/config.xml）
    private Config config = ConfigLoader.load();
    private MailServer mailServer = config.getMailServer();

    // 邮件发送器
    private JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

    public MailService() {  // 初始化

        this.mailSender.setHost(mailServer.getHost());
        this.mailSender.setPort(Integer.parseInt(mailServer.getPort()));
        this.mailSender.setUsername(mailServer.getUsername());
        this.mailSender.setPassword(mailServer.getPassword());

        Properties javaMailProperties = new Properties();
        javaMailProperties.setProperty("mail.transport.protocol", "smtp");
        javaMailProperties.setProperty("mail.smtp.auth", "true");
        javaMailProperties.setProperty("mail.debug", "false");
        this.mailSender.setJavaMailProperties(javaMailProperties);
    }

//    public void register(String emailAddress) {
//
//        String subject = "Stigmergic-Modeling signup confirmation";
//        String content = "<div style=\"background-color: #f0f8fa\">\n" +
//                "    <center>\n" +
//                "        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" style=\"background-color:#f0f8fa\">\n" +
//                "            <tbody>\n" +
//                "                <tr>\n" +
//                "                    <td align=\"center\" valign=\"top\" style=\"padding:38px 18px\">\n" +
//                "                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:600px\">\n" +
//                "                            <tbody>\n" +
//                "                                <tr>\n" +
//                "                                    <td align=\"center\" valign=\"top\">\n" +
//                "                                        <a style=\"text-decoration:none; color:#20beff; font-size:30px\" href=\"https://stigmergic-modeling.net\" target=\"_blank\">\n" +
//                "                                            Stigmergic-Modeling\n" +
//                "                                        </a>\n" +
//                "                                    </td>\n" +
//                "                                </tr>\n" +
//                "                                <tr>\n" +
//                "                                    <td align=\"center\" valign=\"top\" style=\"padding-top:30px;padding-bottom:30px\">\n" +
//                "                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#ffffff;border-collapse:separate!important;border-radius:4px\">\n" +
//                "                                            <tbody>\n" +
//                "                                                <tr>\n" +
//                "                                                    <td align=\"center\" valign=\"top\" style=\"padding-top:30px;padding-bottom:30px\">\n" +
//                "                                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#ffffff;border-collapse:separate!important;border-radius:4px\">\n" +
//                "                                                            <tbody><tr>\n" +
//                "                                                                <td align=\"center\" valign=\"top\">\n" +
//                "                                                                    <h1 style=\"padding:38px 0 12px; margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans; font-size:38px\">Welcome!</h1>\n" +
//                "                                                                    <h3 style=\"font-family:'Helvetica Neue', Helvetica, Arial, sans; font-size:16px; font-weight:normal; line-height:1.5; padding:0;\">Your Stigmergic-Modeling account (lomyal) has been created.<br>Click below to activate it:</h3>\n" +
//                "                                                                </td>\n" +
//                "                                                            </tr>\n" +
//                "                                                            <tr>\n" +
//                "                                                                <td align=\"center\" valign=\"middle\" style=\"padding-right:40px;padding-bottom:40px;padding-left:40px\">\n" +
//                "                                                                    <table border=\"0\" cellpadding=\"10\" cellspacing=\"0\" style=\"background-color:#2799c8;border-collapse:separate!important;border-radius:3px\">\n" +
//                "                                                                        <tbody><tr>\n" +
//                "                                                                            <td align=\"center\" valign=\"middle\">\n" +
//                "                                                                                <a href=\"http://stigmergic-modeling.net/account/verify?id=a8b19be2-5599-4dcf-a17e-38b978d29f02\" style=\"color:#ddd; text-decoration:none; padding:22px 28px; font-size:28px; font-family:'Helvetica Neue', Helvetica, Arial, sans; \" target=\"_blank\">Activate</a>\n" +
//                "                                                                            </td>\n" +
//                "                                                                        </tr>\n" +
//                "                                                                    </tbody></table>\n" +
//                "                                                                </td>\n" +
//                "                                                            </tr>\n" +
//                "                                                            <tr>\n" +
//                "                                                                <td align=\"center\">\n" +
//                "                                                                    <span style=\"font-size:0.75em\">Alternatively, paste this into your browser:<br>\n" +
//                "                                                                        <a href=\"http://stigmergic-modeling.net/account/verify?id=a8b19be2-5599-4dcf-a17e-38b978d29f02\" target=\"_blank\">http://stigmergic-modeling.net/a<wbr>ccount/verif<wbr>y?id=a8b19be<wbr>2-5599-4dcf-<wbr>a17e-38b978d<wbr>29f02</a></span>\n" +
//                "                                                                    </td>\n" +
//                "                                                                </tr>\n" +
//                "                                                            </tbody></table>\n" +
//                "                                                        </td>\n" +
//                "                                                    </tr>\n" +
//                "                                                </tbody>\n" +
//                "                                            </table>\n" +
//                "                                        </td>\n" +
//                "                                    </tr>\n" +
//                "                                    <tr>\n" +
//                "                                        <td align=\"center\" valign=\"top\">\n" +
//                "                                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
//                "                                                <tbody><tr>\n" +
//                "                                                 <td align=\"center\" valign=\"top\" style=\"font-family:'Helvetica Neue', helvetica, sans; font-size:14px; line-height:1.5\">\n" +
//                "                                                     © 2016 Stigmergic-Modeling\n" +
//                "                                                 </td>\n" +
//                "                                             </tr>\n" +
//                "                                         </tbody></table>\n" +
//                "                                     </td>\n" +
//                "                                 </tr>\n" +
//                "                             </tbody>\n" +
//                "                         </table>\n" +
//                "                     </td>\n" +
//                "                 </tr>\n" +
//                "             </tbody>\n" +
//                "         </table>\n" +
//                "     </center>\n" +
//                " </div>";
//
//        this.sendEmail(emailAddress, subject, content);
//    }

    public void sendEmail(final String emailAddress, final String subject, final String content) {

        MimeMessagePreparator preparator = new MimeMessagePreparator() {
            public void prepare(MimeMessage mimeMessage) throws Exception {
                MimeMessageHelper message = new MimeMessageHelper(mimeMessage);
                message.setTo(emailAddress);
                message.setFrom("stigmod@sina.com", "Stigmergic-Modeling Administrator");
                message.setSubject(subject);
                message.setText(content, true);  // true 参数意味接受 html
            }
        };

        this.mailSender.send(preparator);
    }
}
