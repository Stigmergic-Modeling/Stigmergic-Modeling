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
import net.stigmod.domain.conceptualmodel.*;
import net.stigmod.domain.info.ModelingOperationLog;
import net.stigmod.domain.info.ModelingResponse;
import net.stigmod.domain.system.IndividualConceptualModel;
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

import java.util.Iterator;
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
                boolean isFreshCreation = addingType.equals("fresh");

                if (isFreshCreation) {  // 全新创建，但有可能同名融合

                    // 调用 getClassNodeByName 私有方法
                    ClassNode classNode = this.getClassNodeByName(ccmId, icmId, className).getKey();

                    // 更新 id 映射和返回信息
                    modelingResponse.addIdMapping(classId, classNode.getId());  // 向返回对象中添加映射
                    this.addFrontBackIdMapping(icm, classId, classNode.getId());  // 向 ICM 中添加映射

                } else {                // 推荐绑定

                    // 获取 value node
                    Pair<ValueNode, Boolean> valueNodeAndExistence = this.getValueNodeByName(ccmId, icmId, className);
                    ValueNode valueNode = valueNodeAndExistence.getKey();
                    boolean valueNodeExists = valueNodeAndExistence.getValue();

                    // 获取 class node
                    ClassNode classNode = classNodeRepository.findOne(Long.parseLong(classId, 10));
                    classNode.addIcmId(icmId);
                    classNodeRepository.save(classNode);

                    // 获取 c2v edge
                    ClassToValueEdge c2vEdge = null;
                    List<Edge> c2vEdges = null;
                    if (valueNodeExists) {
                        c2vEdges = edgeRepository.getByTwoVertexIdsAndEdgeName(ccmId, classNode.getId(), valueNode.getId(), "", "name");
                        if (!c2vEdges.isEmpty()) {
                            c2vEdge = (ClassToValueEdge) c2vEdges.get(0);  // CCM 中已存在此边
                            c2vEdge.addIcmId(icmId);
                        }
                    }
                    if (!valueNodeExists || c2vEdges.isEmpty()) {  // CCM 中未存在此边
                        c2vEdge = new ClassToValueEdge(ccmId, icmId, "name", classNode, valueNode);
                        classNode.addC2VEdge(c2vEdge);
                        valueNode.addC2VEdge(c2vEdge);
                    }
                    edgeRepository.save(c2vEdge);
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
                ClassNode classNode = classNodeRepository.getOneByName(ccmId, icmId, className);
                assert classNode != null;
                boolean isFreshCreation = addingType.equals("fresh");

                // 获取 relationship node
                RelationNode relationNode = isFreshCreation
                        ? new RelationNode(ccmId, icmId)                                  // 全新创建
                        : relationNodeRepository.findOne(Long.parseLong(attributeId, 10));  // 绑定创建
                if (!isFreshCreation) {  // 绑定创建
                    relationNode.addIcmId(icmId);
                }
                relationNodeRepository.save(relationNode);

                // 获取 r2c edge
                RelationToClassEdge r2cEdge = isFreshCreation
                        ? new RelationToClassEdge(ccmId, icmId, "E0", relationNode, classNode)                          // 全新创建
                        : (RelationToClassEdge) edgeRepository.getOneByTwoVertexIdsAndEdgeName(ccmId, relationNode.getId(), classNode.getId(), "E0", "class");  // 绑定创建
                if (!isFreshCreation) {  // 绑定创建
                    r2cEdge.addIcmId(icmId);
                } else {                 // 全新创建
                    relationNode.addR2CEdge(r2cEdge);
                    classNode.addR2CEdge(r2cEdge);
                }

                // 保存 (relationship)-[class]->(class) 系统
                edgeRepository.save(r2cEdge);

                // 更新 id 映射和返回信息
                if (isFreshCreation) {
                    modelingResponse.addIdMapping(attributeId, relationNode.getId());  // 向返回对象中添加映射
                    this.addFrontBackIdMapping(icm, attributeId, relationNode.getId());  // 向 ICM 中添加映射
                }
                modelingResponse.addMessage("Add attribute [" + attributeName + "] to class [" + className + "] finished.");

                /*
                 *  添加 (relationship)-[isAttribute]->(value)
                 */
                this.addValueNodeAndR2VEdge(ccmId, icmId, "", "isAttribute", relationNode, "true");

                /*
                 *  添加 (relationship)-[e0.role]->(value)
                 */
                this.addValueNodeAndR2VEdge(ccmId, icmId, "E0", "role", relationNode, Util.decapitalize(className));

                /*
                 *  添加 (relationship)-[e1.role]->(value)
                 */
                this.addValueNodeAndR2VEdge(ccmId, icmId, "E1", "role", relationNode, attributeName);

            } else if (op.get(2).equals("RLT")) {  // add relationship

                // ADD RLT relationGroup relation relationCCMId addingType (fresh, binding)
                String relationGroupName = op.get(3);
                String relationshipId = op.get(4);  // 同 op.get(5)
                String addingType = op.get(6);
                boolean isFreshCreation = addingType.equals("fresh");

                // 获取 relationship node
                RelationNode relationNode = isFreshCreation ? new RelationNode(ccmId, icmId) : relationNodeRepository.findOne(Long.parseLong(relationshipId, 10));
                assert relationNode != null;
                if (!isFreshCreation) {
                    relationNode.addIcmId(icmId);
                }
                relationNodeRepository.save(relationNode);

                // 更新 id 映射和返回信息
                if (isFreshCreation) {
                    modelingResponse.addIdMapping(relationshipId, relationNode.getId());  // 向返回对象中添加映射
                    this.addFrontBackIdMapping(icm, relationshipId, relationNode.getId());  // 向 ICM 中添加映射
                }
                modelingResponse.addMessage("Add relationship [" + relationGroupName + "] finished.");

            } else if (op.get(2).equals("POA")) {  // add property of attribute

                // ADD POA class attribute property value
                String className = op.get(3);
                String attributeName = op.get(4);
                String propertyName = op.get(5);
                String propertyValueE1 = op.get(6);

                // name 这个 property 已经在 ADD ATT 操作中处理了，因此这里直接无视
                if (propertyName.equals("name")) return;

                // 获取 relationship node
                RelationNode relationNode = relationNodeRepository.getOneAttRelByClassNameAndAttName(ccmId, icmId, className, attributeName);
                assert relationNode != null;

                if (propertyName.equals("type")) {

                    // 作为类型的类
                    if (propertyValueE1.equals("int") || propertyValueE1.equals("float") || propertyValueE1.equals("string") || propertyValueE1.equals("boolean")) {
                        propertyValueE1 = "_" + propertyValueE1;  // 内置类型名称的特殊处理
                    }
                    ClassNode classNode = this.getClassNodeByName(ccmId, icmId, propertyValueE1).getKey();  // 返回类型类（若不存在则新建）
                    this.addR2CEdge(ccmId, icmId, "E1", "class", relationNode, classNode);  // 添加关系到类型类的边

                } else {

                    // 一般 property
                    String propertyValueE0 = null;
                    switch (propertyName) {
                        case "multiplicity":
                            propertyValueE0 = "1";
                            break;
                        case "visibility":
                            propertyValueE0 = "public";
                            break;
                        case "default":
                        case "constraint":
                        case "subsets":
                        case "redefines":
                            propertyValueE0 = "_";
                            break;
                        case "ordering":
                        case "uniqueness":
                        case "readOnly":
                        case "union":
                        case "composite":
                            propertyValueE0 = "true";
                            break;
                        default:
                            return;
                    }

                    // 添加 (relationship)-[e0.{propertyName}]->(value)
                    this.addValueNodeAndR2VEdge(ccmId, icmId, "E0", propertyName, relationNode, propertyValueE0);

                    // 添加 (relationship)-[e1.{propertyName}]->(value)
                    this.addValueNodeAndR2VEdge(ccmId, icmId, "E1", propertyName, relationNode, propertyValueE1);
                }
                modelingResponse.addMessage("Add property [" + propertyName + "] to attribute [" + attributeName + "] of class [" + className + "] finished.");

            } else if (op.get(2).equals("POR")) {  // add property of relationship

                // ADD POR relationGroup relation property valueE0 valueE1
                String relationGroupName = op.get(3);
                Long relationshipId = this.getNeo4jId(icmId, op.get(4));  // NOTE: may be FrontId or Neo4jId !!!
                String propertyName = op.get(5);
                String propertyValueE0 = op.get(6);
                String propertyValueE1 = op.get(7);

                // 获取关系节点（必定存在于 ICM 中）
                RelationNode relationNode = relationNodeRepository.findOne(relationshipId);
                assert relationNode != null;

                switch (propertyName) {
                    case "type":   // 关系的类型和名称（名称可能为空字符串）

                        String typeEdgeName = "is" + propertyValueE0;
                        this.addValueNodeAndR2VEdge(ccmId, icmId, "", typeEdgeName, relationNode, "true");

                        if (!propertyValueE1.equals("")) {  // 若有名字，则添加
                            this.addValueNodeAndR2VEdge(ccmId, icmId, "", "name", relationNode, propertyValueE1);
                        }

                        break;
                    case "class":   // 关系两端的类

                        // 获取关系两端的 class node (必定存在于 ICM 中)
                        ClassNode classNodeE0 = classNodeRepository.getOneByName(ccmId, icmId, propertyValueE0);
                        ClassNode classNodeE1 = classNodeRepository.getOneByName(ccmId, icmId, propertyValueE1);
                        assert classNodeE0 != null && classNodeE1 != null;

                        // 添加 r2cEdge
                        this.addR2CEdge(ccmId, icmId, "E0", "class", relationNode, classNodeE0);
                        this.addR2CEdge(ccmId, icmId, "E1", "class", relationNode, classNodeE1);

                        break;
                    default:   // 一般 property

                        this.addValueNodeAndR2VEdge(ccmId, icmId, "E0", propertyName, relationNode, propertyValueE0);
                        this.addValueNodeAndR2VEdge(ccmId, icmId, "E1", propertyName, relationNode, propertyValueE1);
                        break;
                }
                modelingResponse.addMessage("Add property [" + propertyName + "] to relationship [" + relationshipId.toString() + "] of relationship group [" + relationGroupName + "] finished.");

            } else {
                throw new IllegalArgumentException("Operation " + op.get(1) + " " + op.get(2) + " is not supported");  // NOT ALLOWED
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
    private Long getBackIdFromFrontId(Long icmId, String frontId) {
        IndividualConceptualModel icm = icmRepository.findOne(icmId);
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
        icmRepository.save(icm);
    }

    /**
     * 若 value node 已存在于数据库，则返回该节点；若不存在，则创建并返回
     * @param name 值节点的名字
     * @param ccmId ccmId
     * @param icmId icmId
     * @return 值节点 和 存在性
     */
    @Transactional
    private Pair<ValueNode, Boolean> getValueNodeByName(Long ccmId, Long icmId, String name) {
        List<ValueNode> valueNodes = valueNodeRepository.findByNameAndCcmId(name, ccmId);
        Boolean exist = !valueNodes.isEmpty();
        ValueNode valueNode = exist ? valueNodes.get(0) : new ValueNode(ccmId, icmId, name);
        if (exist) {
            valueNode.addIcmId(icmId);
        }
        valueNodeRepository.save(valueNode);
        return new Pair<>(valueNode, exist);
    }

//    /**
//     * 根据类名，获取类节点（注意，这里不会考虑绑定，ICM 中有就是有，没有就在 ICM 中新建）
//     * @param ccmId ccmId
//     * @param icmId icmId
//     * @param className 类名
//     * @return 类节点 和 存在性
//     */
//    @Transactional
//    private Pair<ClassNode, Boolean> getClassNodeByName(Long ccmId, Long icmId, String className) {
//
//        // 获取 value node
//        Pair<ValueNode, Boolean> valueNodeAndExistence = this.getValueNodeByName(ccmId, icmId, className);
//        ValueNode valueNode = valueNodeAndExistence.getKey();
//        boolean valueNodeExists = valueNodeAndExistence.getValue();
//
//        // 获取 class node
//        if (valueNodeExists) {
//            List<ClassNode> classNodes = classNodeRepository.getByName(ccmId, icmId, className);
//            if (!classNodes.isEmpty()) {
//                return new Pair<>(classNodes.get(0), true);  // ICM 中有类节点，直接返回
//            }
//        }
//
//        // ICM 中没有想要的类节点，创建后返回
//        ClassNode classNode = new ClassNode(ccmId, icmId);
//        ClassToValueEdge c2vEdge = new ClassToValueEdge(ccmId, icmId, "name", classNode, valueNode);
//        classNode.addC2VEdge(c2vEdge);
//        valueNode.addC2VEdge(c2vEdge);
//        edgeRepository.save(c2vEdge); // 保存
//
//        return new Pair<>(classNode, false);
//    }

    /**
     * 根据类名，获取类节点（考虑 class node 的同名融合，CCM 中有就是有，没有就在 ICM 中新建）
     * @param ccmId ccmId
     * @param icmId icmId
     * @param className 类名
     * @return 类节点 和 存在性
     */
    @Transactional
    private Pair<ClassNode, Boolean> getClassNodeByName(Long ccmId, Long icmId, String className) {

        // 获取 value node
        Pair<ValueNode, Boolean> valueNodeAndExistence = this.getValueNodeByName(ccmId, icmId, className);
        ValueNode valueNode = valueNodeAndExistence.getKey();
        boolean valueNodeExists = valueNodeAndExistence.getValue();

        // 获取 class node
        if (valueNodeExists) {
            List<ClassNode> classNodes = classNodeRepository.getByName(ccmId, icmId, className);
            if (!classNodes.isEmpty()) {  // ICM 中有类节点，直接返回
                return new Pair<>(classNodes.get(0), true);
            } else {
                classNodes = classNodeRepository.getAllByName(ccmId, className);
                if (!classNodes.isEmpty()) {  // CCM 中有类节点，将 icmId 加入后返回
//                    ClassNode classNode = this.findTheMostReferencedElement(classNodes);
                    ClassNode classNode = classNodes.get(0);
                    classNode.addIcmId(icmId);
                    classNodeRepository.save(classNode);  // class node
                    ClassToValueEdge c2vEdge = (ClassToValueEdge) edgeRepository.getOneByTwoVertexIdsAndEdgeName(ccmId, classNode.getId(), valueNode.getId(), "", "name");
                    c2vEdge.addIcmId(icmId);
                    edgeRepository.save(c2vEdge); // class to value edge
                    return new Pair<>(classNode, true);  // 这里是返回 true 还是 false，需要根据需求而定，目前都行
                }
            }
        }

        // ICM 中没有想要的类节点，创建后返回
        ClassNode classNode = new ClassNode(ccmId, icmId);
        ClassToValueEdge c2vEdge = new ClassToValueEdge(ccmId, icmId, "name", classNode, valueNode);
        classNode.addC2VEdge(c2vEdge);
        valueNode.addC2VEdge(c2vEdge);
        edgeRepository.save(c2vEdge); // 保存

        return new Pair<>(classNode, false);
    }

//    /**
//     * 返回引用最多的元素
//     * @param elements
//     * @return
//     */
//    private ConceptualModelElement findTheMostReferencedElement(List<ConceptualModelElement> elements) {
//
//        ConceptualModelElement ret = null;
//        long baseNum = 0L;
//
//        for (ConceptualModelElement element : elements) {
//            long icmNum = element.countIcmNum();
//            if (icmNum > baseNum) {
//                baseNum = icmNum;
//                ret = element;
//            }
//        }
//        return ret;
//    }

    /**
     * 在关系节点和类节点间创建边，此边可能已经存在于 CCM 中
     * 注意，必须保证 relationNode 和 classNode 的 id 不为 null
     * @param ccmId ccmId
     * @param icmId icmId
     * @param port 关系节点的端口
     * @param edgeName 边的名称
     * @param relationNode 关系节点
     * @param classNode 类节点
     */
    @Transactional
    private void addR2CEdge(Long ccmId, Long icmId, String port, String edgeName, RelationNode relationNode, ClassNode classNode) {

        Long relationshipId = relationNode.getId();
        Long classId = classNode.getId();
        if (relationshipId == null || classId == null) {
            throw new IllegalArgumentException();  // 必须保证 relationNode 和 classNode 的 id 不为 null
        }

        RelationToClassEdge r2cEdge;
        List<Edge> r2cEdges = edgeRepository.getByTwoVertexIdsAndEdgeName(ccmId, relationshipId, classId, port, edgeName);
        if (!r2cEdges.isEmpty()) {  // CCM 中已存在此边
            r2cEdge = (RelationToClassEdge) r2cEdges.get(0);
            r2cEdge.addIcmId(icmId);
        } else {                    // CCM 中未存在此边
            r2cEdge = new RelationToClassEdge(ccmId, icmId, port, edgeName, relationNode, classNode);
            relationNode.addR2CEdge(r2cEdge);
            classNode.addR2CEdge(r2cEdge);
        }
        edgeRepository.save(r2cEdge);  // 若用 neo4jTemplate.save()，则可能导致保存不及时
    }

    /**
     * 以一个 relationship node 为起点，添加一个 value node，并连接这两个 node （可能 value node 已存在于 CCM，也可能两个 node 都已存在于 CCM）
     * @param ccmId ccmId
     * @param icmId icmId
     * @param port 关系的端口（E0, E1 或 空）
     * @param edgeName 关系节点与直接点之间边的名字（注意不是关系的名字）
     * @param relationNode 关系节点
     * @param valueName 值节点的名字
     */
    @Transactional
    private void addValueNodeAndR2VEdge(Long ccmId, Long icmId, String port, String edgeName, RelationNode relationNode, String valueName) {

        // 获取 value node
        Pair<ValueNode, Boolean> valueNodeAndExistence = this.getValueNodeByName(ccmId, icmId, valueName);
        ValueNode valueNode = valueNodeAndExistence.getKey();
        boolean valueNodeExists = valueNodeAndExistence.getValue();

        // 获取 edge
        RelationToValueEdge r2trueEdge = null;
        List<Edge> r2trueEdges = null;
        if (valueNodeExists) {
            r2trueEdges = edgeRepository.getByTwoVertexIdsAndEdgeName(ccmId, relationNode.getId(), valueNode.getId(), port, edgeName);
            if (!r2trueEdges.isEmpty()) {
                r2trueEdge = (RelationToValueEdge) r2trueEdges.get(0);  // CCM 中已存在此边
                r2trueEdge.addIcmId(icmId);
            }
        }
        if (!valueNodeExists || r2trueEdges.isEmpty()) {  // CCM 中未存在此边
            r2trueEdge = new RelationToValueEdge(ccmId, icmId, port, edgeName, relationNode, valueNode);
            relationNode.addR2VEdge(r2trueEdge);
            valueNode.addR2VEdge(r2trueEdge);
        }
        edgeRepository.save(r2trueEdge);  // 若用 neo4jTemplate.save()，则可能导致保存不及时
    }

    /**
     * 由 FrontId 获得 Neo4jId。若本来就是 Neo4jId，则直接转成 Long 类型
     * @param icmId icmId，id mapping 即保存在其中
     * @param id may be FrontId or Neo4jId !!!
     * @return Neo4jId
     */
    private Long getNeo4jId(Long icmId, String id) {
        return this.getBackIdFromFrontId(icmId, id);
    }
}
