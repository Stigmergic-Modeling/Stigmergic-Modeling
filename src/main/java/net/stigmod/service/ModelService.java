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
import net.stigmod.domain.system.SystemInfo;
import net.stigmod.domain.system.User;
import net.stigmod.repository.node.CollectiveConceptualModelRepository;
import net.stigmod.repository.node.IndividualConceptualModelRepository;
import net.stigmod.repository.node.SystemInfoRepository;
import net.stigmod.repository.node.UserRepository;
import org.neo4j.ogm.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private SystemInfoRepository sysRepo;

    // 全新新建 Model
    @Transactional
    public void createIcmClean(User user, String name, String description, String language) throws IllegalArgumentException  {

        if (name.equals("")) {
            throw new IllegalArgumentException("Model name can not be empty.");
        }
        if (description.equals("")) {
            throw new IllegalArgumentException("Model description can not be empty.");
        }

        // 保证新名称不与用户已有 ICM 名称重复
        this.checkIcmDuplication(user.getId(), 0L, name, "new");

        // 新建 ICM
        IndividualConceptualModel icm = new IndividualConceptualModel(name, description, language);
        icm.addUser(user);
        user.addIcm(icm);

        // 新建 CCM
        CollectiveConceptualModel ccm = new CollectiveConceptualModel(name, description, language);
        ccm.addIcm(icm);
        icm.addCcm(ccm);
        ccmRepo.save(ccm);
    }

    // 继承新建 Model
    @Transactional
    public void createIcmInherited(User user, String name, String description, Long ccmId, String language) throws IllegalArgumentException {

        if (ccmId == null) {
            throw new IllegalArgumentException("You must choose one Collective Conceptual Model to be inherited.");
        }
        if (name.equals("")) {
            throw new IllegalArgumentException("Model name can not be empty.");
        }
        if (description.equals("")) {
            throw new IllegalArgumentException("Model description can not be empty.");
        }

        // 保证新名称不与用户已有 ICM 名称重复
        this.checkIcmDuplication(user.getId(), 0L, name, "new");

        // 新建 ICM
        IndividualConceptualModel icm = new IndividualConceptualModel(name, description, language);
        icm.addUser(user);
        user.addIcm(icm);

        // 获取 CCM
        CollectiveConceptualModel ccm = ccmRepo.getCcmById(ccmId);
        ccm.addIcm(icm);
        icm.addCcm(ccm);
        ccmRepo.save(ccm);
    }

    // 获取所有 CCM (不包含用户已经参与的 CCM)
    @Transactional
    public Set<CollectiveConceptualModel> getAllCcms() {
        return ccmRepo.getAllCcms();
    }

    // 获取所有 CCM 的 name
    @Transactional
    public List<String> getAllCcmNames() {
        return ccmRepo.getAllCcmNames();
    }

    // 获取所有 CCM 的 name 和 id
    @Transactional
    public List<String> getAllCcmNamesAndIds() {
        List<Map<String, Object>> namesAndIds = ccmRepo.getAllCcmNamesAndIds();
        List<String> ret = new ArrayList<>();
        for (Map<String, Object> nameAndId : namesAndIds) {
            ret.add(nameAndId.get("name") + "-" + nameAndId.get("id"));
        }
        return ret;
    }

    // 设置活跃 CCM
    @Transactional
    public void setAsActivatedCcm(String ccmNameAndId) {

        String[] nameAndIdArray = ccmNameAndId.split("-");
        String ccmName = nameAndIdArray[0];
        Long ccmId = Long.parseLong(nameAndIdArray[1], 10);

        SystemInfo systemInfo = sysRepo.getSystemInfo();
        systemInfo.setActivatedCcmName(ccmName);
        systemInfo.setActivatedCcmId(ccmId);
        sysRepo.save(systemInfo);
    }

    // 获取某用户的所有 ICM
    @Transactional
    public List<IndividualConceptualModel> getAllIcmsOfUser(User user) {
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

    // 更新 ICM 信息
    @Transactional
    public void updateIcmInfo(Long userId, Long id, String name, String description) {

        // 保证新名称不与用户已有 ICM 名称重复
        this.checkIcmDuplication(userId, id, name, "modify");

        IndividualConceptualModel icm = icmRepo.findOne(id);
        icm.setName(name);
        icm.setDescription(description);
        icmRepo.save(icm);
    }

    // 删除 ICM 信息（解除该 ICM 与当前用户的关联，而将该 ICM 连接到系统内置的 “回收 ICM 专用用户账号” 上）
    @Transactional
    public void deleteIcmInfo(Long icmId) {

        // 获取 recycle bin user
        String recycleBinUserMail = "recycle@stigmod.net";
        User recycleBinUser = userRepo.findByMail(recycleBinUserMail);
        if (recycleBinUser == null) {  // 若没有改账户，则创建
            String password = ((Long) new Random().nextLong()).toString();
            recycleBinUser = new User("RecycleBin", recycleBinUserMail, password, User.SecurityRole.ROLE_ADMIN);
        }

        // 获取当前 User 和 ICM
        User user = userRepo.getUserFromSession();
        IndividualConceptualModel icm = icmRepo.findOne(icmId);

        // 改名并回收 ICM
        String newName = icm.getName() + "_" + user.getId() + "_" + new Date().getTime();
        icm.removeUser(user);
        user.removeIcm(icm);
        icm.addUser(recycleBinUser);
        recycleBinUser.addIcm(icm);
        icm.setName(newName);
        icmRepo.save(icm);
    }

    // 由 ICM ID 获取 ICM
    @Transactional
    public IndividualConceptualModel getIcmById(Long id) {
        return icmRepo.findOne(id);
    }

    // 保证新名称不与用户已有 ICM 名称重复
    private void checkIcmDuplication(Long userId, Long id, String name, String type) {
        List<Number> icmIdsTakenTheName = icmRepo.getByNameAndUserId(userId, name);
        for (Number icmIdTakenTheName : icmIdsTakenTheName) {

            // 若是新建，则有一个重名都不行
            // 若是修改，允许当前 ICM 名称不变，但不允许和该用户其他 ICM 重名
            if (type.equals("new") || icmIdTakenTheName.longValue() != id) {
                throw new IllegalArgumentException("You already have a model named as " + name);
            }
        }
    }
}
