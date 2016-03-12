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
