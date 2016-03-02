/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import com.google.gson.Gson;
import javafx.util.Pair;
import net.stigmod.domain.info.ModelingOperationLog;
import net.stigmod.domain.info.ModelingResponse;
import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.IndividualConceptualModel;
import net.stigmod.domain.node.RelationNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.domain.relationship.RelationToClassEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.IndividualConceptualModelRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.repository.relationship.ClassToVEdgeRepository;
import net.stigmod.repository.relationship.EdgeRepository;
import net.stigmod.repository.relationship.RelationToCEdgeRepository;
import net.stigmod.repository.relationship.RelationToVEdgeRepository;
import net.stigmod.util.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/2/27
 */
@Service
public class WorkspaceService {

    @Autowired
    private Neo4jOperations neo4jTemplate;

    @Autowired
    private IndividualConceptualModelRepository icmRepository;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private RelationNodeRepository relationNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    @Autowired
    private ClassToVEdgeRepository c2vEdgeRepository;

    @Autowired
    private RelationToCEdgeRepository r2cEdgeRepository;

    @Autowired
    private RelationToVEdgeRepository r2vEdgeRepository;

    @Autowired
    private EdgeRepository edgeRepository;

    @Transactional
    public void testNeo4jSaving(Long icmId, Long ccmId) {
        ClassNode clazz = new ClassNode();
        ValueNode value = new ValueNode();
        ClassToValueEdge c2vEdge = new ClassToValueEdge("1", "name", clazz, value);
        clazz.addC2VEdge(c2vEdge);
        value.addC2VEdge(c2vEdge);

        neo4jTemplate.save(clazz);
    }

    /**
     * 从前端向后端同步建模结果
     * @param molJsonString 字符串形式的 LOG
     * @return 要返回给前端的 Response
     */
    public ModelingResponse modelingOperationSync(String molJsonString) {
        ModelingOperationLog mol = constructMOL(molJsonString);
        return executeMOL(mol);
    }

    /**
     * 将 JSON 字符串转换为 ModelingOperationLog 对象
     * @param molJsonString 字符串形式的 LOG
     * @return 对象形式的 LOG
     */
    public ModelingOperationLog constructMOL(String molJsonString) {
        Gson gson = new Gson();
        return gson.fromJson(molJsonString, ModelingOperationLog.class);
    }

    /**
     * 执行建模操作日志
     * @param mol 前端传回来的操作日志
     */
    @Transactional
    public ModelingResponse executeMOL(ModelingOperationLog mol) {
        List<List<String>> ops = mol.log;
        Long ccmId = mol.ccmId;
        Long icmId = mol.icmId;
        ModelingResponse modelingResponse = new ModelingResponse();
        IndividualConceptualModel icm = icmRepository.findOne(icmId);

        for (List<String> op : ops) {
            executeOP(op, ccmId, icmId, modelingResponse, icm);
        }

        return modelingResponse;
    }

    /**
     * 执行单条操作
     *
     * -- 日志条目的格式：
     *
     * - 增加
     * ADD CLS class classCCMId addingType (fresh, binding)
     * ADD RLG relationGroup
     * ADD ATT class attribute attributeCCMId addingType (fresh, binding)
     * ADD RLT relationGroup relation relationCCMId addingType (fresh, binding)
     * ADD POA class attribute property value
     * ADD POR relationGroup relation property value
     *
     * - 修改key
     * MOD CLS classOld classNew
     * MOD RLG relationGroupOld relationGroupNew
     * MOD ATT class attributeOld attributeNew
     * // MOD RLT relationGroup relationOld relationNew
     *
     * - 修改value
     * MOD POA class attribute property value
     * MOD POR relationGroup relation property value
     *
     * - 删除
     * RMV CLS class
     * RMV RLG relationGroup
     * RMV ATT class attribute
     * RMV RLT relationGroup relation
     * RMV POA class attribute property
     * RMV POR relationGroup relation property
     *
     * - 插入order元素
     * ODI ATT class attribute position direction
     * ODI RLT relationGroup relation position direction
     *
     * - 修改order元素名称
     * ODE ATT class attributeOld attributeNew
     * // ODE RLT relationGroup relationOld relationNew
     *
     * - 删除order元素
     * ODR ATT class attribute
     * ODR RLT relationGroup relation
     *
     * - 移动order元素
     * ODM ATT class attribute position direction
     * ODM RLT relationGroup relation position direction
     *
     * @param op 一条操作
     */
    @Transactional
    public void executeOP(List<String> op, Long ccmId, Long icmId, ModelingResponse modelingResponse, IndividualConceptualModel icm) {

        // 注意，op 的第一个元素是 Date
        if (op.get(1).equals("ADD")) {
            if (op.get(2).equals("CLS")) {  // add class

                // ADD CLS class classCCMId addingType (fresh, binding)
                String className = op.get(3);
                String classId = op.get(4);
                String addingType = op.get(5);
                boolean classNodeExists = !addingType.equals("fresh");

                // 获取 value node
                Pair<ValueNode, Boolean> valueNodeAndExistence = this.getValueNodeByName(className, ccmId, icmId);
                ValueNode valueNode = valueNodeAndExistence.getKey();
                boolean valueNodeExists = valueNodeAndExistence.getValue();

                // 获取 class node
                ClassNode classNode = classNodeExists ? classNodeRepository.findOne(Long.parseLong(classId, 10)) : new ClassNode(ccmId, icmId);
                if (classNodeExists) {
                    classNode.addIcmId(icmId);
                    neo4jTemplate.save(classNode);
                }

                // 获取 c2v edge
                ClassToValueEdge c2vEdge = null;
                List<ClassToValueEdge> c2vEdges = null;
                if (classNodeExists && valueNodeExists) {
                    c2vEdges = c2vEdgeRepository.findByClassIdAndValueId(classNode.getId(), valueNode.getId());
                    if (!c2vEdges.isEmpty()) {
                        c2vEdge = c2vEdges.get(0);  // CCM 中已存在此边
                        c2vEdge.addIcmId(icmId);
                    }
                }
                if (!classNodeExists || !valueNodeExists || c2vEdges.isEmpty()) {  // CCM 中未存在此边
                    c2vEdge = new ClassToValueEdge(ccmId, icmId, "name", classNode, valueNode);
                    classNode.addC2VEdge(c2vEdge);
                    valueNode.addC2VEdge(c2vEdge);
                }

                // 保存
                neo4jTemplate.save(c2vEdge);

                // 更新 id 映射和返回信息
                if (!classNodeExists) {
                    modelingResponse.addIdMapping(classId, classNode.getId());  // 向返回对象中添加映射
                    this.addFrontBackIdMapping(icm, classId, classNode.getId());  // 向 ICM 中添加映射
                }
                modelingResponse.addMessage("Add class [" + className + "] finished.");

            } else if (op.get(2).equals("RLG")) {  // add relation group
                // DO NOTHING

            } else if (op.get(2).equals("ATT")) {  // add attribute

                // ADD ATT class attribute attributeCCMId addingType (fresh, binding)
                String className = op.get(3);
                String attributeName = op.get(4);
                String attributeId = op.get(5);
                String addingType = op.get(6);

                /*
                 *  添加 (relationship)-[e0.class]->(class)
                 */

                // 获取 class node （一定存在于 ICM 中）
                ClassNode classNode = classNodeRepository.getByName(className, icmId);
                assert classNode != null;
                boolean isFreshCreation = addingType.equals("fresh");

                // 获取 relationship node
                RelationNode relationNode = isFreshCreation
                        ? new RelationNode(ccmId, icmId)                                  // 全新创建
                        : relationNodeRepository.findOne(Long.parseLong(attributeId, 10));  // 绑定创建
                if (!isFreshCreation) {  // 绑定创建
                    relationNode.addIcmId(icmId);
                    neo4jTemplate.save(relationNode);
                }

                // 获取 r2c edge
                RelationToClassEdge r2cEdge = isFreshCreation
                        ? new RelationToClassEdge(ccmId, icmId, "E0", relationNode, classNode)                          // 全新创建
                        : r2cEdgeRepository.getByRelationIdAndClassId(ccmId, relationNode.getId(), classNode.getId());  // 绑定创建
                if (!isFreshCreation) {  // 绑定创建
                    r2cEdge.addIcmId(icmId);
                } else {                 // 全新创建
                    relationNode.addR2CEdge(r2cEdge);
                    classNode.addR2CEdge(r2cEdge);
                }

                // 保存 (relationship)-[class]->(class) 系统
                neo4jTemplate.save(r2cEdge);

                // 更新 id 映射和返回信息
                if (isFreshCreation) {
                    modelingResponse.addIdMapping(attributeId, relationNode.getId());  // 向返回对象中添加映射
                    this.addFrontBackIdMapping(icm, attributeId, relationNode.getId());  // 向 ICM 中添加映射
                }
                modelingResponse.addMessage("Add attribute [" + attributeName + "] to class [" + className + "] finished.");

//                /*
//                 *  添加 (relationship)-[isAttribute]->(value)
//                 */
//
//                // 获取名为 "true" 的 value node
//                Pair<ValueNode, Boolean> valueNodeAndExistence = this.getValueNodeByName("true", ccmId, icmId);
//                ValueNode vnTrue = valueNodeAndExistence.getKey();
//                boolean vnTrueExists = valueNodeAndExistence.getValue();
//
////                // 获取 r2vEdge
////                RelationToValueEdge r2trueEdge = vnTrueExists
////                        ? (RelationToValueEdge) edgeRepository.getByTwoVertexIdsAndEdgeName(ccmId, relationNode.getId(), vnTrue.getId(), "isAttribute")
////                        : new RelationToValueEdge(ccmId, icmId, "isAttribute", relationNode, vnTrue);
//
//
//                /*
//                 *  添加 (relationship)-[e0.role]->(value)
//                 */
//
//                // 获取名为 className (lower case) 的 value node
//                valueNodeAndExistence = this.getValueNodeByName(className, ccmId, icmId);
//                ValueNode vnClassNameLC = valueNodeAndExistence.getKey();
//                boolean vnClassNameLCExists = valueNodeAndExistence.getValue();
//
//                /*
//                 *  添加 (relationship)-[e1.role]->(value)
//                 */
//
//                // 获取名为 attributeName 的 value node
//                valueNodeAndExistence = this.getValueNodeByName(Util.decapitalize(attributeName), ccmId, icmId);
//                ValueNode vnattributeName = valueNodeAndExistence.getKey();
//                boolean vnattributeNameExists = valueNodeAndExistence.getValue();


            } else if (op.get(2).equals("RLT")) {  // add relationship

            } else if (op.get(2).equals("POA")) {  // add property of attribute

            } else if (op.get(2).equals("POR")) {  // add property of relationship

            } else {
                // NOT ALLOWED
            }
        } else {
            // DO NOTHING
        }
    }

    /**
     * 由前端 ID 获得相应的后端 ID
     * @param icmId ICM ID
     * @param frontId 前端临时 ID
     * @return 后端数据库 ID
     */
    @Transactional
    private Long getBackIdFromFrontId(IndividualConceptualModel icm, String frontId) {
        return icm.getBackIdFromFrontId(frontId);
    }

    /**
     * 向 ICM 中添加 ID 映射
     * @param icmId ICM ID
     * @param frontId 前端临时 ID
     * @param backId 后端数据库 ID
     */
    @Transactional
    private void addFrontBackIdMapping(IndividualConceptualModel icm, String frontId, Long backId) {
        icm.addIdMapping(frontId, backId);
        neo4jTemplate.save(icm);
    }

    private Pair<ValueNode, Boolean> getValueNodeByName(String name, Long ccmId, Long icmId) {
        List<ValueNode> valueNodes = valueNodeRepository.findByNameAndCcmId(name, ccmId);
        Boolean exist = !valueNodes.isEmpty();
        ValueNode valueNode = exist ? valueNodes.get(0) : new ValueNode(ccmId, icmId, name);
        if (exist) {
            valueNode.addIcmId(icmId);
            neo4jTemplate.save(valueNode);  // add icmId 后需要及时保存
        }
        return new Pair<>(valueNode, exist);
    }
}
