/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.service.migrateService.MigrateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/3/19
 */
@Service
public class SessionService {

    private SessionRegistry sessionRegistry;

    @Autowired
    private MigrateService migrateService;

    private boolean alreadyRun = false;

    public void checkMerging() {
        System.out.println("checkMerging");

        if (this.getOnlineUserNumber() > 0) {  // 当前有用户在建模，等待所有用户完成操作后再执行融合算法
            alreadyRun = false;
            return;
        }

        if (alreadyRun || migrateService.isRunning()) {
            return;
        }

        alreadyRun = false;
        migrateService.migrateAlgorithmImpls(282L);
        alreadyRun = true;
    }

    /**
     * 返回在线人数（同一账户多人同时登录时，重复计算人数）
     * @return 在线人数
     */
    public long getOnlineUserNumber() {
        List<Object> principals = sessionRegistry.getAllPrincipals();
        return principals.size();
    }

    public SessionRegistry getSessionRegistry() {
        return sessionRegistry;
    }

    public void setSessionRegistry(SessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }
}
