/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Service;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;


/**
 * SpringMVC 启动监听器
 * @author Shijun Wang
 * @version 2016/3/19
 */
@Service
public class StartupListener implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private SessionService sessionService;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent evt) {
        if (evt.getApplicationContext().getParent() == null) {
            this.addModelMergingTask();
        }
    }

    /**
     * 增加 检查是否可以执行融合算法 的定时任务
     */
    private void addModelMergingTask() {

        Runnable runnable = new Runnable() {
            public void run() {
                sessionService.checkMerging();
            }
        };

        ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();
        service.scheduleAtFixedRate(runnable, 5, 10, TimeUnit.SECONDS);

        System.out.println("Finish adding model merging task.");
    }

//    private void createSitemap() {
////        Timer timer = new Timer("createSitemap", true);
////        timer.schedule(new TimerTask() {
////            @Override
////            public void run() {
////                System.out.println("--->Create sitemap...");
////                sites.createSiteMap();
////                System.out.println("--->Success create sitemap...");
////            }
////        }, 1 * TimeUtils.MIN);
//    }
}
