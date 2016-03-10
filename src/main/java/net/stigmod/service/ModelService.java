/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.system.CollectiveConceptualModel;
import net.stigmod.domain.system.IndividualConceptualModel;
import net.stigmod.domain.system.User;
import net.stigmod.repository.node.CollectiveConceptualModelRepository;
import net.stigmod.repository.node.IndividualConceptualModelRepository;
import org.neo4j.ogm.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * @author Shijun Wang
 * @version 2016/1/25
 */
@Service
public class ModelService {

    @Autowired
    private Session session;

    @Autowired
    private Neo4jOperations neo4jTemplate;

    @Autowired
    private CollectiveConceptualModelRepository ccmRepo;

    @Autowired
    private IndividualConceptualModelRepository icmRepo;

    // 全新新建 Model
    @Transactional
    public void createIcmClean(User user, String name, String description) {

        // 新建 ICM
        IndividualConceptualModel icm = new IndividualConceptualModel(name, description);
        icm.addUser(user);

        // 新建 CCM
        CollectiveConceptualModel ccm = new CollectiveConceptualModel(name, description);
        ccm.addIcm(icm);
        session.save(ccm);
    }

    // 继承新建 Model
    @Transactional
    public void createIcmInherited(User user, String name, String description, Long ccmId) {

        // 新建 ICM
        IndividualConceptualModel icm = new IndividualConceptualModel(name, description);
        icm.addUser(user);

        // 获取 CCM
        CollectiveConceptualModel ccm = ccmRepo.getCcmById(ccmId);
        ccm.addIcm(icm);
        session.save(ccm);
    }

    // 获取所有 CCM (不包含用户已经参与的 CCM)
    @Transactional
    public Set<CollectiveConceptualModel> getAllCcms() {
        return ccmRepo.getAllCcms();
    }

    // 获取某用户的所有 ICM
    @Transactional
    public Set<IndividualConceptualModel> getAllIcmsOfUser(User user) {
        return icmRepo.getAllIcmsOfUser(user.getId());
    }

    // 获取某用户的某 ICM （根据 icm 名字）
    @Transactional
    public IndividualConceptualModel getIcmOfUserByName(User user, String icmName) {
        return icmRepo.getIcmOfUserByName(user.getId(), icmName);
    }

    // 获取某 ICM 所在 CCM 的 ID
    @Transactional
    public Long getCcmIdOfIcm(Long icmId) {
        return ccmRepo.getCcmByIcmId(icmId).getId();
    }

    // 由 ICM ID 获取 CCM 对象
    @Transactional
    public CollectiveConceptualModel getCcmOfUserByIcmId(Long icmId) {
        return ccmRepo.getCcmByIcmId(icmId);
    }
}
