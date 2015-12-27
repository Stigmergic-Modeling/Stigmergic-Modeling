/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service.migrateService;

import net.stigmod.domain.node.ClassNode;
import net.stigmod.domain.node.CollectiveConceptualModel;
import net.stigmod.domain.node.RelationNode;
import net.stigmod.domain.node.ValueNode;
import net.stigmod.domain.relationship.ClassToValueEdge;
import net.stigmod.domain.relationship.RelationToCEdge;
import net.stigmod.domain.relationship.RelationToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.CollectiveConceptualModelRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.repository.relationship.ClassToVEdgeRepository;
import net.stigmod.repository.relationship.RelationToCEdgeRepository;
import net.stigmod.repository.relationship.RelationToVEdgeRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

/**
 * 
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public class MigrateHandlerImpl implements MigrateHandler {

    @Autowired
    private CollectiveConceptualModelRepository collectiveConceptualModelRepository;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private RelationNodeRepository relationNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    @Autowired
    private ClassToVEdgeRepository classToVEdgeRepository;

    @Autowired
    private RelationToCEdgeRepository relationToCEdgeRepository;

    @Autowired
    private RelationToVEdgeRepository relationToVEdgeRepository;

    @Autowired
    private MigrateUtil migrateUtil;

    @Autowired
    private EntropyHandler entropyHandler;

    private List<ClassNode> classNodeList;

    private List<RelationNode> relationNodeList;

    private List<ValueNode> valueNodeList;

    private boolean isStable=false;

    /**
     * 初始化
     * @param id (the id is ccm id)
     */
    public void migrateInit(Long id) {
        //获取ccm对象
        CollectiveConceptualModel ccm=collectiveConceptualModelRepository.findOne(id);

        //获取ccm中各种node的数据
        this.classNodeList=convertClassIdToObj(ccm.getClassNodesId());
        this.relationNodeList=convertRelationIdToObj(ccm.getRelationNodesId());
        this.valueNodeList=convertValueIdToObj(ccm.getValueNodesId());

        //初始化isStable函数
        this.isStable=false;
    }

    @Override
    public void migrateHandler() {
        int cNum=classNodeList.size();
        int rNum=relationNodeList.size();
        int iterNum=cNum+rNum;
        int curIterNum=0;
        while(true) {
            isStable=true;//在migrateClassNode和migrateRelationNode中若发生迁移则会由isStable转为false;
            int randValue=randomValue();
            if(randValue<cNum) migrateClassNode(classNodeList.get(randValue));
            else migrateRelationNode(relationNodeList.get(randValue-cNum));
            if(isStable&&curIterNum>iterNum) break;
            else if(isStable) curIterNum++;
            else curIterNum=0;
        }
        System.out.println("迭代结束啦~");
    }

    private void migrateClassNode(ClassNode classNode) {
        Set<Long> icmIdSet=classNode.getIcmList();
        for(Long icmId:icmIdSet) {
            findLowerEntropyLocForClass(icmId , classNode);
        }
    }

    private void migrateRelationNode(RelationNode relationNode) {
        Set<Long> icmIdSet=relationNode.getIcmList();
        for(Long icmId:icmIdSet) {
            findLowerEntropyLocForRelation(icmId , relationNode);
        }
    }

    private void findLowerEntropyLocForClass(Long icmId , ClassNode classNode) {
        double maxEntropyDecrease=0.0;
        long targetClassNodeId=-1; //因为我们目标是全局最小的熵值节点
        Set<ClassNode> alreadyHasCurIcmClassNode=new HashSet<>();//这个集合放入的元素全部是和classNode一样拥有icmId用户的节点
        boolean isNullNode=false;

        for(int i=0;i<classNodeList.size();i++) {//遍历classNodeList,找出使classNode节点迁移icmId用户后下降最多的节点
            ClassNode tmpCNode=classNodeList.get(i);
            if(tmpCNode.getId()==classNode.getId()) continue;//本身
            if(tmpCNode.getIcmList().size()==0) isNullNode=true;
            if(tmpCNode.getIcmList().contains(icmId)) {
                alreadyHasCurIcmClassNode.add(tmpCNode);
                continue;//如果是同样包含有该用户的节点,则先保存在already中.
            }
            double var=simulateMigrateForClass(icmId,classNode,tmpCNode);
            if(Double.compare(maxEntropyDecrease,var)>0) {
                maxEntropyDecrease=var;
                targetClassNodeId=tmpCNode.getId();
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isNullNode) {
            ClassNode classNode2=new ClassNode();
            double var2=simulateMigrateForClass(icmId,classNode,classNode2);
            if(Double.compare(maxEntropyDecrease,var2)>0) {
                classNodeRepository.save(classNode2);//在数据库中保存该节点
                maxEntropyDecrease=var2;
                targetClassNodeId=classNode2.getId();
            }
        }

        if(targetClassNodeId!=-1) {
            migrateClassNodeForOneStep(icmId,classNode.getId(),targetClassNodeId);
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }

        //2: 判断该用户迁移到其他包含该用户的节点上,系统熵值是否会下降
        if(targetClassNodeId==-1) {
            for(ClassNode twoStepCNode : alreadyHasCurIcmClassNode) {
                double twoStepVar=migrateClassNodeNeedTwoStep(icmId,classNode.getId(),twoStepCNode.getId());
                if(Double.compare(twoStepVar,0.0)<0) {
                    isStable=false;
                    return;//这部分搞定就可以直接结束了
                }
            }
        }
    }

    private double simulateMigrateForClass(Long icmId,ClassNode sourceCNode,ClassNode targetCNode) {
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化
        //记录全局熵的变化
//        double oldGlobalEntropy;
//        double curGlobalEntropy;

        Map<String,List<Set<Long>>>  oldSourceMap=entropyHandler.getMapForClassNode(sourceCNode.getCtvEdges(),sourceCNode.getRtcEdges());
        Map<String,List<Set<Long>>>  oldTargetMap=entropyHandler.getMapForClassNode(targetCNode.getCtvEdges(),targetCNode.getRtcEdges());

        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();

        Set<Long> dupVNodeSet=new HashSet<>();//判断是否会出现重复切换某一个点
        List<Long> emergeVIdList=new ArrayList<>();
        List<String> emergeVNameList=new ArrayList<>();
        for(ClassToValueEdge ctvEdge : sourceCNode.getCtvEdges()) {
            String edgeName=ctvEdge.getEdgeName();
            int usize=ctvEdge.getIcmList().size();
            if(usize==0) continue;
            if(ctvEdge.getIcmList().contains(icmId)) {//说明当前边包含了当前用户
                usize--;
                ValueNode valueNode=ctvEdge.getEnder();
                emergeVIdList.add(valueNode.getId());
                emergeVNameList.add(edgeName);
                if(dupVNodeSet.contains(valueNode.getId()));
                else {
                    dupVNodeSet.add(valueNode.getId());
                    var+=migrateUtil.MigrateFromClassToClassForValueNode(icmId,valueNode,sourceCNode,targetCNode);
                }
            }

            Set<Long> tTmp=new HashSet<>(ctvEdge.getIcmList());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) tTmp.remove(icmId);
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        Set<Long> dupRNodeSet=new HashSet<>();//判断是否会出现一个relation两条边指向一个class
        List<Long> emergeRIdList=new ArrayList<>();
        List<String> emergeRNameList=new ArrayList<>();
        List<String> emergeRPortList=new ArrayList<>();
        for(RelationToCEdge rtcEdge : sourceCNode.getRtcEdges()) {
            String edgeName=rtcEdge.getEdgeName();
            String port=rtcEdge.getPort();
            int usize=rtcEdge.getIcmList().size();
            if(usize==0) continue;
            if(rtcEdge.getIcmList().contains(icmId)) {
                usize--;
                RelationNode relationNode=rtcEdge.getStarter();
                emergeRIdList.add(relationNode.getId());
                emergeRNameList.add(edgeName);
                emergeRPortList.add(port);
                if(dupRNodeSet.contains(relationNode.getId()));
                else {
                    dupRNodeSet.add(relationNode.getId());
                    var+=migrateUtil.MigrateFromClassToClassForRelationNode(icmId,relationNode,sourceCNode,targetCNode);
                }
            }

            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmList());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) tTmp.remove(icmId);
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        //上述这两步完成了对newSourceMap的构建,接下来是newTargetMap的构建

        for(ClassToValueEdge ctvEdge:targetCNode.getCtvEdges()) {
            String edgeName=ctvEdge.getEdgeName();
            int usize=ctvEdge.getIcmList().size();
            Long vId=ctvEdge.getEnder().getId();
            int emVSize=emergeVIdList.size();
            for(int i=0;i<emVSize;i++) {
                Long emergeVId=emergeVIdList.get(i);
                String emergeEdgeName=emergeVNameList.get(i);
                if(emergeVId!=vId||!emergeEdgeName.equals(edgeName)) continue;
                usize++;
                emergeVIdList.remove(i);
                emergeVNameList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(ctvEdge.getIcmList());
            if(usize!=tTmp.size()) tTmp.add(icmId);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(RelationToCEdge rtcEdge:targetCNode.getRtcEdges()) {
            String edgeName=rtcEdge.getEdgeName();
            String port=rtcEdge.getPort();
            int usize=rtcEdge.getIcmList().size();
            Long rId=rtcEdge.getStarter().getId();
            int emRSize=emergeRIdList.size();
            for(int i=0;i<emRSize;i++) {
                Long emergeRId=emergeRIdList.get(i);
                String emergeEdgeName=emergeRNameList.get(i);
                String emergePort=emergeRPortList.get(i);
                if(emergeRId!=rId||!emergeEdgeName.equals(edgeName)||!emergePort.equals(port)) continue;
                usize++;
                emergeRIdList.remove(i);
                emergeRNameList.remove(i);
                emergeRPortList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmList());
            if(usize!=tTmp.size()) tTmp.add(icmId);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(int i=0;i<emergeVIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>();
            tTmp.add(icmId);
            String edgeName=emergeVNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(int i=0;i<emergeRIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>();
            tTmp.add(icmId);
            String edgeName=emergeRNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        //完成了newTargetMap的构建
        double oldSourceEntropy=entropyHandler.compueteMapEntropy(oldSourceMap);
        double newSourceEntropy=entropyHandler.compueteMapEntropy(newSourceMap);
        double oldTargetEntropy=entropyHandler.compueteMapEntropy(oldTargetMap);
        double newTargetEntropy=entropyHandler.compueteMapEntropy(newTargetMap);

        //获取变化的var值
        double sourceVar=newSourceEntropy-oldSourceEntropy;
        double targetVar=newTargetEntropy-oldTargetEntropy;
        sumEntropyVar+=var;
        sumEntropyVar+=sourceVar;
        sumEntropyVar+=targetVar;
        return sumEntropyVar;
    }

    /**
     * 将用户从一个class节点迁移到另一个class节点,这个是一步的,因为另一个class节点一定不包含该用户
     * @param icmId
     * @param sourceClassNodeId
     * @param targetClassNodeId
     */
    public void migrateClassNodeForOneStep(Long icmId,Long sourceClassNodeId,Long targetClassNodeId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        ClassNode sourceClassNode=classNodeRepository.findOne(sourceClassNodeId);
        ClassNode targetClassNode=classNodeRepository.findOne(targetClassNodeId);

        sourceClassNode.getIcmList().remove(icmId);
        targetClassNode.getIcmList().add(icmId);

        //对于sourceClassNode的classToValue部分
        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges()) {
            if(ctvEdge.getIcmList().size()==0||!ctvEdge.getIcmList().contains(icmId)) continue;
            ctvEdge.getIcmList().remove(icmId);
            String edgeName=ctvEdge.getEdgeName();
            ValueNode valueNode=ctvEdge.getEnder();
            //下面要把该边上的该用户从sourceClassNode迁移到targetClassNode
            boolean isContainFlag=false;
            for(ClassToValueEdge ctvEdge2 : targetClassNode.getCtvEdges()) {
                if (ctvEdge2.getEdgeName().equals(edgeName) && ctvEdge2.getEnder().equals(valueNode)) {
                    isContainFlag=true;
                    ctvEdge2.getIcmList().add(icmId);
                    break;
                }
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                ClassToValueEdge tmpCtvEdge=new ClassToValueEdge(edgeName,targetClassNode,valueNode);
                targetClassNode.getCtvEdges().add(tmpCtvEdge);//我觉得这句话可以去掉的
                valueNode.getCtvEdges().add(tmpCtvEdge);//这句应该也可以去掉的
                classToVEdgeRepository.save(tmpCtvEdge);//classToVEdgeRepository这个
            }
        }

        //对于sourceClassNode的relationToClass部分
        for(RelationToCEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            if(rtcEdge.getIcmList().size()==0||rtcEdge.getIcmList().contains(icmId)) continue;
            rtcEdge.getIcmList().remove(icmId);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            RelationNode relationNode=rtcEdge.getStarter();
            //下面要把改变上的该用户从sourceClassNode迁移到targetClassNode上去
            boolean isContainFlag=false;
            for(RelationToCEdge rtcEdge2 : targetClassNode.getRtcEdges()) {
                if(rtcEdge2.getPort().equals(port)&&rtcEdge2.getEdgeName().equals(edgeName)
                        &&rtcEdge2.getStarter().equals(relationNode)) {
                    isContainFlag=true;
                    rtcEdge2.getIcmList().add(icmId);
                    break;
                }
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                RelationToCEdge tmpRtcEdge=new RelationToCEdge(port,edgeName,relationNode,targetClassNode);
                targetClassNode.getRtcEdges().add(tmpRtcEdge);
                relationNode.getRtcEdges().add(tmpRtcEdge);
                relationToCEdgeRepository.save(tmpRtcEdge);
            }
        }
        classNodeRepository.save(sourceClassNode);
        classNodeRepository.save(targetClassNode);
    }

    /**
     * 目标是返回当前sourceClass上的用户迁移到targetClass上系统熵值减小/增加幅度
     * @param icmId
     * @param sourceClassNodeId
     * @param targetClassNodeId
     */
    public Double migrateClassNodeNeedTwoStep(Long icmId,Long sourceClassNodeId,Long targetClassNodeId) {
        //首先是判断如果targetClass没有当前icmId用户,将sourceClass上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetClass上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        ClassNode sourceClassNode=classNodeRepository.findOne(sourceClassNodeId);
        ClassNode targetClassNode=classNodeRepository.findOne(targetClassNodeId);

        //由于在模拟迁移之后若系统总熵值不能减小,我们则需要将这些节点还原
        Set<ClassNode> protectedClassNodes = new HashSet<>();
        Set<RelationNode> protectedRelationNodes = new HashSet<>();
        Set<ValueNode> protectedValueNodes = new HashSet<>();
        Set<ClassToValueEdge> protectedClassToVEdges = new HashSet<>();
        Set<RelationToCEdge> protectedRelationToCEdges = new HashSet<>();

        //这是我们需要废弃的边的集合
        Map<String,Set<Long>> unNecessaryValueNodeMap = new HashMap<>();
        Map<String,Set<Long>> unNecessaryRelationNodeMap = new HashMap<>();


        double minEntropyDown=0x7FFFFFFF;
        long minVarCNodeId=-1;  //我们希望找到的是引起targetClass节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况
        //这里的目标是把target上的class节点迁移到otherClassNode上去,看看是否有效果
        for(ClassNode otherClassNode : classNodeList) {
            if(otherClassNode.getIcmList().contains(icmId)) continue;
            double var=simulateMigrateForClass(icmId,targetClassNode,otherClassNode);
            if(otherClassNode.getIcmList().size()==0) isTravseNUllNode=true;
            if(Double.compare(minEntropyDown,var)>0) {
                minEntropyDown=var;
                minVarCNodeId=otherClassNode.getId();
            }
        }

        if(!isTravseNUllNode) {
            ClassNode tClassNode=new ClassNode();
            double var=simulateMigrateForClass(icmId,targetClassNode,tClassNode);
            if(Double.compare(minEntropyDown,var)>0) {
                minEntropyDown=var;
                minVarCNodeId=tClassNode.getId();
            }else tClassNode=null;
        }

        if(minVarCNodeId!=-1) {//说明确实找到了可以让该节点熵值下降的通道
            //先把所有节点保护起来
            protectedClassNodes.add(new ClassNode(targetClassNode));
            protectedClassNodes.add(new ClassNode(classNodeRepository.findOne(minVarCNodeId)));//首先保存两个classNode

            //统计因迁移而产生的边,将其放入到集合unNecessary中
            ClassNode newMinVarCNode=new ClassNode(classNodeRepository.findOne(minVarCNodeId));

            for(ClassToValueEdge protectedCtvEdge : targetClassNode.getCtvEdges()) {//把所有targetClassNode到valueNode的边全部获取
                protectedClassToVEdges.add(new ClassToValueEdge(protectedCtvEdge));
                protectedValueNodes.add(new ValueNode(protectedCtvEdge.getEnder()));
            }
            for(ClassToValueEdge protectedCtvEdge : newMinVarCNode.getCtvEdges()) {
                protectedClassToVEdges.add(new ClassToValueEdge(protectedCtvEdge));
            }
            for(RelationToCEdge protectedRtcEdge : targetClassNode.getRtcEdges()) {//把所有relationNode到targetClassNode的边全部获取到
                protectedRelationToCEdges.add(new RelationToCEdge(protectedRtcEdge));
                protectedRelationNodes.add(new RelationNode(protectedRtcEdge.getStarter()));
            }
            for(RelationToCEdge protectedRtcEdge : newMinVarCNode.getRtcEdges()) {//把所有relationNode到targetClassNode的边全部获取到
                protectedRelationToCEdges.add(new RelationToCEdge(protectedRtcEdge));
            }

            //获取迁移造成的副产品(边的增多)
            findUnNecessaryClassNodeEdge(icmId,targetClassNode,newMinVarCNode,unNecessaryValueNodeMap,unNecessaryRelationNodeMap);

            //将targetClass上的icmId正式迁移到minVarCNodeId节点上去
            migrateClassNodeForOneStep(icmId, targetClassNodeId, minVarCNodeId);//我现在想做的一个原则就是,在这步不进行save
            //如果需要恢复到迁移前,则在下面启动恢复过程
        }
        //上面这个migrateClassNodeForOneStep实实在在的把targetClassNode上的icmId迁移到了minVarCNodeId对应节点上

        double simVar=simulateMigrateForClass(icmId,sourceClassNode,targetClassNode);
        if(Double.compare(simVar,0.0)>0) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0)>0) {
                //需要复原之前的迁移
                recoverMigrateStateForClassNode(minVarCNodeId,protectedClassNodes,protectedRelationNodes,
                        protectedValueNodes,protectedClassToVEdges,protectedRelationToCEdges,
                        unNecessaryValueNodeMap,unNecessaryRelationNodeMap);//还原原有的节点格局
            }else ;//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>0) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>0) {//说明迁移后系统熵值减小,这是成功的
                    migrateClassNodeForOneStep(icmId,sourceClassNodeId,targetClassNodeId);
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForClassNode(minVarCNodeId,protectedClassNodes,protectedRelationNodes,
                            protectedValueNodes,protectedClassToVEdges,protectedRelationToCEdges,
                            unNecessaryValueNodeMap,unNecessaryRelationNodeMap);//还原原有的节点格局
                }
            }else {
                //成功,我们需要将souceClass上的icmId用户迁移到targetClass上去
                migrateClassNodeForOneStep(icmId,sourceClassNodeId,targetClassNodeId);
            }
        }
        return simVar+minEntropyDown;
    }

    private void findLowerEntropyLocForRelation(Long icmId , RelationNode relationNode) {
        double maxEntropyDecrease=0.0;
        long targetRelationNodeId=-1;
        Set<RelationNode> alreadyHasCurIcmRelationNode=new HashSet<>();
        boolean isNullNode=false;

        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode tmpRNode=relationNodeList.get(i);
            if(tmpRNode.getId()==relationNode.getId()) continue;//本身
            if(tmpRNode.getIcmList().contains(icmId)) {
                alreadyHasCurIcmRelationNode.add(tmpRNode);
                continue;//如果是同样包含有该用户的节点,则先保存在already中.
            }
            double var=simulateMigrateForRelation(icmId, relationNode, tmpRNode);
            if(Double.compare(maxEntropyDecrease,var)>0) {
                maxEntropyDecrease=var;
                targetRelationNodeId=tmpRNode.getId();
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isNullNode) {
            RelationNode relationNode2=new RelationNode();
            double var2=simulateMigrateForRelation(icmId, relationNode, relationNode2);
            if(Double.compare(maxEntropyDecrease,var2)>0) {
                relationNodeRepository.save(relationNode2);//在数据库中保存该节点
                maxEntropyDecrease=var2;
                targetRelationNodeId=relationNode2.getId();
            }
        }

        if(targetRelationNodeId!=-1) {
            migrateRelationNodeForOneStep(icmId, relationNode.getId(), targetRelationNodeId);
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }

        //2: 判断该用户迁移到其他包含该用户的节点上,系统熵值是否会下降
        if(targetRelationNodeId==-1) {
            for(RelationNode twoStepRNode : alreadyHasCurIcmRelationNode) {
                double twoStepVar=migrateRelationNodeNeedTwoStep(icmId, relationNode.getId(), twoStepRNode.getId());
                if(Double.compare(twoStepVar,0.0)<0) {
                    isStable=false;
                    return;//这部分搞定就可以直接结束了
                }
            }
        }
    }


    private double simulateMigrateForRelation(Long icmId,RelationNode sourceRNode,RelationNode targetRNode) {
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化
        //记录全局熵的变化
//        double oldGlobalEntropy;
//        double curGlobalEntropy;

        Map<String,List<Set<Long>>>  oldSourceMap =
                entropyHandler.getMapForRelationNode(sourceRNode.getRtcEdges(),sourceRNode.getRtvEdges());
        Map<String,List<Set<Long>>>  oldTargetMap =
                entropyHandler.getMapForRelationNode(sourceRNode.getRtcEdges(),sourceRNode.getRtvEdges());

        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();

        Set<Long> dupVNodeSet=new HashSet<>();//判断是否会出现重复切换某一个点
        List<Long> emergeVIdList=new ArrayList<>();
        List<String> emergeVPortList=new ArrayList<>();
        List<String> emergeVNameList=new ArrayList<>();
        for(RelationToValueEdge rtvEdge : sourceRNode.getRtvEdges()) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            int usize=rtvEdge.getIcmList().size();
            if(usize==0) continue;
            if(rtvEdge.getIcmList().contains(icmId)) {//说明当前边包含了当前用户
                usize--;
                ValueNode valueNode=rtvEdge.getEnder();
                emergeVIdList.add(valueNode.getId());
                emergeVPortList.add(port);
                emergeVNameList.add(edgeName);
                if(dupVNodeSet.contains(valueNode.getId()));
                else {
                    dupVNodeSet.add(valueNode.getId());
                    var+=migrateUtil.MigrateFromRelationToRelationForValueNode(icmId,valueNode,sourceRNode,targetRNode);
                }
            }

            Set<Long> tTmp=new HashSet<>(rtvEdge.getIcmList());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) tTmp.remove(icmId);
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        Set<Long> dupCNodeSet=new HashSet<>();//判断是否会出现一个relation两条边指向一个class
        List<Long> emergeCIdList=new ArrayList<>();
        List<String> emergeCPortList=new ArrayList<>();
        List<String> emergeCNameList=new ArrayList<>();
        for(RelationToCEdge rtcEdge : sourceRNode.getRtcEdges()) {
            String edgeName=rtcEdge.getEdgeName();
            String port=rtcEdge.getPort();
            int usize=rtcEdge.getIcmList().size();
            if(usize==0) continue;
            if(rtcEdge.getIcmList().contains(icmId)) {
                usize--;
                ClassNode classNode=rtcEdge.getEnder();
                emergeCIdList.add(classNode.getId());
                emergeCPortList.add(port);
                emergeCNameList.add(edgeName);
                if(dupCNodeSet.contains(classNode.getId()));
                else {
                    dupCNodeSet.add(classNode.getId());
                    var+=migrateUtil.MigrateFromRelationToRelationForClassNode(icmId,classNode,sourceRNode,targetRNode);
                }
            }

            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmList());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) tTmp.remove(icmId);
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        //上述这两步完成了对newSourceMap的构建,接下来是newTargetMap的构建
        for(RelationToValueEdge rtvEdge:targetRNode.getRtvEdges()) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            int usize=rtvEdge.getIcmList().size();
            Long vId=rtvEdge.getEnder().getId();
            int emVSize=emergeVIdList.size();//这个是记录了sourceRNode所连接的value节点中包含有curIcmId的个数
            for(int i=0;i<emVSize;i++) {
                Long emergeVId=emergeVIdList.get(i);
                String emergePort=emergeVPortList.get(i);
                String emergeEdgeName=emergeVNameList.get(i);
                if(emergeVId!=vId||!emergePort.equals(port)||!emergeEdgeName.equals(edgeName)) continue;
                usize++;
                emergeVIdList.remove(i);
                emergeVPortList.remove(i);
                emergeVNameList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtvEdge.getIcmList());
            if(usize!=tTmp.size()) tTmp.add(icmId);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(RelationToCEdge rtcEdge:targetRNode.getRtcEdges()) {
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            int usize=rtcEdge.getIcmList().size();
            Long cId=rtcEdge.getEnder().getId();//获取class的id
            int emCSize=emergeCIdList.size();
            for(int i=0;i<emCSize;i++) {
                Long emergeCId=emergeCIdList.get(i);
                String emergePort=emergeCPortList.get(i);
                String emergeEdgeName=emergeCNameList.get(i);
                if(emergeCId!=cId||!emergePort.equals(port)||!emergeEdgeName.equals(edgeName)) continue;
                usize++;
                emergeCIdList.remove(i);
                emergeCNameList.remove(i);
                emergeCPortList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmList());
            if(usize!=tTmp.size()) tTmp.add(icmId);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        //这部分就是我们要新加入的边
        for(int i=0;i<emergeVIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>();
            tTmp.add(icmId);
//            String port=emergeVPortList.get(i);
            String edgeName=emergeVNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(int i=0;i<emergeCIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>();
            tTmp.add(icmId);
            String edgeName=emergeCNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        //完成了newTargetMap的构建
        double oldSourceEntropy=entropyHandler.compueteMapEntropy(oldSourceMap);
        double newSourceEntropy=entropyHandler.compueteMapEntropy(newSourceMap);
        double oldTargetEntropy=entropyHandler.compueteMapEntropy(oldTargetMap);
        double newTargetEntropy=entropyHandler.compueteMapEntropy(newTargetMap);

        //获取变化的var值
        double sourceVar=newSourceEntropy-oldSourceEntropy;
        double targetVar=newTargetEntropy-oldTargetEntropy;
        sumEntropyVar+=var;
        sumEntropyVar+=sourceVar;
        sumEntropyVar+=targetVar;
        return sumEntropyVar;
    }

    public void migrateRelationNodeForOneStep(Long icmId,Long sourceRelationNodeId,Long targetRelationNodeId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        RelationNode sourceRelationNode=relationNodeRepository.findOne(sourceRelationNodeId);
        RelationNode targetRelationNode=relationNodeRepository.findOne(targetRelationNodeId);

        sourceRelationNode.getIcmList().remove(icmId);
        targetRelationNode.getIcmList().add(icmId);

        //对于sourceRelationNode的RelationToValue部分
        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            if(rtvEdge.getIcmList().size()==0||!rtvEdge.getIcmList().contains(icmId)) continue;
            rtvEdge.getIcmList().remove(icmId);
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            ValueNode valueNode=rtvEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode
            boolean isContainFlag=false;
            for(RelationToValueEdge rtvEdge_target : targetRelationNode.getRtvEdges()) {
                if (rtvEdge_target.getPort().equals(port) && rtvEdge_target.getEdgeName().equals(edgeName)
                        && rtvEdge_target.getEnder().getId().equals(valueNode.getId())) {
                    isContainFlag=true;//targetRelationNode中已经包含了该节点
                    rtvEdge_target.getIcmList().add(icmId);
                    break;
                }
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                RelationToValueEdge tmpRtvEdge=new RelationToValueEdge(port,edgeName,targetRelationNode,valueNode);
                targetRelationNode.getRtvEdges().add(tmpRtvEdge);//我觉得这句话可以去掉的
                valueNode.getRtvEdges().add(tmpRtvEdge);//这句应该也可以去掉的
                relationToVEdgeRepository.save(tmpRtvEdge);//relationToVEdgeRepository这个
            }
        }

        //对于sourceRelationNode的relationToClass部分
        for(RelationToCEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            if(rtcEdge.getIcmList().size()==0||rtcEdge.getIcmList().contains(icmId)) continue;
            rtcEdge.getIcmList().remove(icmId);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            ClassNode classNode=rtcEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode上去
            boolean isContainFlag=false;
            for(RelationToCEdge rtcEdge_target : targetRelationNode.getRtcEdges()) {
                if(rtcEdge_target.getPort().equals(port) && rtcEdge_target.getEdgeName().equals(edgeName)
                        && rtcEdge_target.getEnder().getId().equals(classNode.getId())) {
                    isContainFlag=true;
                    rtcEdge_target.getIcmList().add(icmId);
                    break;
                }
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                RelationToCEdge tmpRtcEdge=new RelationToCEdge(port,edgeName,targetRelationNode,classNode);
                targetRelationNode.getRtcEdges().add(tmpRtcEdge);
                classNode.getRtcEdges().add(tmpRtcEdge);
                relationToCEdgeRepository.save(tmpRtcEdge);
            }
        }
        relationNodeRepository.save(sourceRelationNode);
        relationNodeRepository.save(targetRelationNode);
    }

    public Double migrateRelationNodeNeedTwoStep(Long icmId,Long sourceRelationNodeId,Long targetRelationNodeId) {
        //首先是判断如果targetRelation没有当前icmId用户,将sourceRelation上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetRelation上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        RelationNode sourceRelationNode=relationNodeRepository.findOne(sourceRelationNodeId);
        RelationNode targetRelationNode=relationNodeRepository.findOne(targetRelationNodeId);

        //由于在模拟迁移之后若系统总熵值不能减小,我们则需要将这些节点还原
        Set<ClassNode> protectedClassNodes = new HashSet<>();
        Set<RelationNode> protectedRelationNodes = new HashSet<>();
        Set<ValueNode> protectedValueNodes = new HashSet<>();
        Set<RelationToValueEdge> protectedRelationToVEdges = new HashSet<>();
        Set<RelationToCEdge> protectedRelationToCEdges = new HashSet<>();

        //这是我们需要废弃的边的集合
        Map<String,Set<Long>> unNecessaryClassNodeMap = new HashMap<>();
        Map<String,Set<Long>> unNecessaryValueNodeMap = new HashMap<>();

        double minEntropyDown=0x7FFFFFFF;
        long minVarRNodeId=-1;  //我们希望找到的是引起targetRelation节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况
        //这里的目标是把target上的relation节点迁移到otherRelationNode上去,看看是否有效果
        for(RelationNode otherRelationNode : relationNodeList) {
            if(otherRelationNode.getIcmList().contains(icmId)) continue;
            double var=simulateMigrateForRelation(icmId,targetRelationNode,otherRelationNode);
            if(otherRelationNode.getIcmList().size()==0) isTravseNUllNode=true;
            if(Double.compare(minEntropyDown,var)>0) {
                minEntropyDown=var;
                minVarRNodeId=otherRelationNode.getId();
            }
        }
        if(!isTravseNUllNode) {
            RelationNode tRelationNode=new RelationNode();
            double var=simulateMigrateForRelation(icmId,targetRelationNode,tRelationNode);
            if(Double.compare(minEntropyDown,var)>0) {
                minEntropyDown=var;
                minVarRNodeId=tRelationNode.getId();
            }else tRelationNode=null;
        }

        if(minVarRNodeId!=-1) {//说明确实找到了可以让该节点熵值下降的通道
            //先把所有节点保护起来
            protectedRelationNodes.add(new RelationNode(targetRelationNode));
            protectedRelationNodes.add(new RelationNode(relationNodeRepository.findOne(minVarRNodeId)));//首先保存两个classNode

            //统计因迁移而产生的边,将其放入到集合unNecessary中
            RelationNode newMinVarRNode=new RelationNode(relationNodeRepository.findOne(minVarRNodeId));

            for(RelationToValueEdge protectedRtvEdge : targetRelationNode.getRtvEdges()) {//把所有targetRelationNode到valueNode的边全部获取
                protectedRelationToVEdges.add(new RelationToValueEdge(protectedRtvEdge));
                protectedValueNodes.add(new ValueNode(protectedRtvEdge.getEnder()));
            }
            for(RelationToValueEdge protectedRtvEdge : newMinVarRNode.getRtvEdges()) {
                protectedRelationToVEdges.add(new RelationToValueEdge(protectedRtvEdge));
            }

            for(RelationToCEdge protectedRtcEdge : targetRelationNode.getRtcEdges()) {//把所有targetRelationNode到classNode的边全部获取到
                protectedRelationToCEdges.add(new RelationToCEdge(protectedRtcEdge));
                protectedClassNodes.add(new ClassNode(protectedRtcEdge.getEnder()));
            }
            for(RelationToCEdge protectedRtcEdge : newMinVarRNode.getRtcEdges()) {//把所有newMinRNode到classNode的边全部获取到
                protectedRelationToCEdges.add(new RelationToCEdge(protectedRtcEdge));
            }

            //获取迁移造成的副产品(边的增多)
            findUnNecessaryRelationNodeEdge(icmId, targetRelationNode, newMinVarRNode, unNecessaryValueNodeMap, unNecessaryClassNodeMap);

            //将targetRelation上的icmId正式迁移到minVarRNodeId节点上去
            migrateRelationNodeForOneStep(icmId, targetRelationNodeId, minVarRNodeId);
            //如果需要恢复到迁移前,则在下面启动恢复过程
        }
        //上面这个migrateRelationNodeForOneStep实实在在的把targetRelationNode上的icmId迁移到了minVarRNodeId对应节点上

        double simVar=simulateMigrateForRelation(icmId, sourceRelationNode, targetRelationNode);
        if(Double.compare(simVar,0.0)>0) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0)>0) {
                //需要复原之前的迁移
                recoverMigrateStateForRelationNode(minVarRNodeId , protectedClassNodes , protectedRelationNodes ,
                        protectedValueNodes , protectedRelationToCEdges , protectedRelationToVEdges ,
                        unNecessaryValueNodeMap , unNecessaryClassNodeMap);//还原原有的节点格局
            }else ;//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>0) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>0) {//说明迁移后系统熵值减小,这是成功的
                    migrateRelationNodeForOneStep(icmId, sourceRelationNodeId, targetRelationNodeId);
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForRelationNode(minVarRNodeId , protectedClassNodes , protectedRelationNodes ,
                            protectedValueNodes , protectedRelationToCEdges , protectedRelationToVEdges ,
                            unNecessaryValueNodeMap , unNecessaryClassNodeMap);//还原原有的节点格局
                }
            }else {
                //成功,我们需要将souceRelation上的icmId用户迁移到targetRelation上去
                migrateClassNodeForOneStep(icmId,sourceRelationNodeId,targetRelationNodeId);
            }
        }
        return simVar+minEntropyDown;
    }


    /**
     * 获取一个随机数
     * @return 随机数(范围在0~class和relation节点总数-1)
     */
    private int randomValue() {
        int sum=classNodeList.size()+relationNodeList.size();
        Random random=new Random();
        int target=Math.abs(random.nextInt())%sum;
        return target;
    }

    private List<ClassNode> convertClassIdToObj(Set<Long> classNodeIdSet) {
        List<ClassNode> classNodeList=new ArrayList<ClassNode>();
        for(Long id:classNodeIdSet) {
            ClassNode classNode=classNodeRepository.findOne(id);
            classNodeList.add(classNode);
        }
        return classNodeList;
    }

    private List<RelationNode> convertRelationIdToObj(Set<Long> relationNodeIdSet) {
        List<RelationNode> relationNodeList=new ArrayList<RelationNode>();
        for(Long id:relationNodeIdSet) {
            RelationNode relationNode=relationNodeRepository.findOne(id);
            relationNodeList.add(relationNode);
        }
        return relationNodeList;
    }

    private List<ValueNode> convertValueIdToObj(Set<Long> valueNodeIdSet) {
        List<ValueNode> valueNodeList=new ArrayList<ValueNode>();
        for(Long id:valueNodeIdSet) {
            ValueNode valueNode=valueNodeRepository.findOne(id);
            valueNodeList.add(valueNode);
        }
        return valueNodeList;
    }

    /**
     * 用来在两步类迁移过程恢复class迁移第一步状态
     * @param protectedClassNodes
     * @param protectedRelationNodes
     * @param protectedClassToVEdges
     * @param protectedRelationToCEdges
     */
    private void recoverMigrateStateForClassNode(Long targetCNodeId ,
            Set<ClassNode> protectedClassNodes , Set<RelationNode> protectedRelationNodes ,
            Set<ValueNode> protectedValueNodes ,Set<ClassToValueEdge> protectedClassToVEdges ,
            Set<RelationToCEdge> protectedRelationToCEdges , Map<String,Set<Long>> unNecessaryValueNodeMap ,
            Map<String,Set<Long>> unNecessaryRelationNodeMap) {

        //首先把targetCNode因为迁移产生的多余节点去掉
        ClassNode targetCNode=classNodeRepository.findOne(targetCNodeId);
//        Set<ClassToValueEdge> needDiscardCTVEdge = new HashSet<>();
//        Set<RelationToCEdge> needDiscardRTCEdge = new HashSet<>();
        for(ClassToValueEdge ctvEdge : targetCNode.getCtvEdges()) {
            String edgeName=ctvEdge.getEdgeName();
            Long vid=ctvEdge.getEnder().getId();
            if(unNecessaryValueNodeMap.containsKey(edgeName)&&unNecessaryValueNodeMap.get(edgeName).contains(vid)) {
                //说明这个是新建的边
//                needDiscardCTVEdge.add(ctvEdge);
//                targetCNode.getCtvEdges().remove(ctvEdge);
                classToVEdgeRepository.delete(ctvEdge);
            }
        }
        for(RelationToCEdge rtcEdge : targetCNode.getRtcEdges()) {
            String name=rtcEdge.getEdgeName();
            String port=rtcEdge.getPort();
            String fullName=port+"."+name;
            Long rid=rtcEdge.getStarter().getId();
            if(unNecessaryRelationNodeMap.containsKey(fullName)&&unNecessaryRelationNodeMap.get(fullName).contains(rid)) {
//                needDiscardRTCEdge.add(rtcEdge);
//                targetCNode.getRtcEdges().remove(rtcEdge);
                relationToCEdgeRepository.delete(rtcEdge);
            }
        }

        for(ClassNode classNode : protectedClassNodes) {
            Long nid=classNode.getId();
            ClassNode waitUpdateClassNode=classNodeRepository.findOne(nid);//这个就是我们要还原的节点
            waitUpdateClassNode.UpdateClassNode(classNode);//更新class node节点
            classNodeRepository.save(waitUpdateClassNode);
        }

        for(RelationNode relationNode : protectedRelationNodes) {
            Long nid=relationNode.getId();
            RelationNode waitUpdateRelationNode=relationNodeRepository.findOne(nid);
            waitUpdateRelationNode.UpdateRelationNode(relationNode);//更新relation node节点
            relationNodeRepository.save(waitUpdateRelationNode);
        }

        //valueNode也需要修改,因为有边
        for(ValueNode valueNode : protectedValueNodes) {
            Long nid=valueNode.getId();
            ValueNode waitUpdateRelationNode=valueNodeRepository.findOne(nid);
            waitUpdateRelationNode.UpdateValueNode(valueNode);
            valueNodeRepository.save(waitUpdateRelationNode);
        }

        for(ClassToValueEdge classToValueEdge : protectedClassToVEdges) {
            Long nid=classToValueEdge.getId();
            ClassToValueEdge waitUpdateClassToVENode=classToVEdgeRepository.findOne(nid);
            waitUpdateClassToVENode.UpdateClassToVEdge(classToValueEdge);
            classToVEdgeRepository.save(waitUpdateClassToVENode);
        }

        for(RelationToCEdge relationToCEdge : protectedRelationToCEdges) {
            Long nid=relationToCEdge.getId();
            RelationToCEdge waitUpdateRelationToCENode=relationToCEdgeRepository.findOne(nid);
            waitUpdateRelationToCENode.UpdateRelationToCEdge(relationToCEdge);
            relationToCEdgeRepository.save(waitUpdateRelationToCENode);
        }
    }


    private void recoverMigrateStateForRelationNode(
            Long targetRNodeId , Set<ClassNode> protectedClassNodes , Set<RelationNode> protectedRelationNodes ,
            Set<ValueNode> protectedValueNodes ,Set<RelationToCEdge> protectedRelationToCEdges ,
            Set<RelationToValueEdge> protectedRelationToVEdges , Map<String,Set<Long>> unNecessaryClassNodeMap ,
            Map<String,Set<Long>> unNecessaryValueNodeMap) {

        //首先把targetCNode因为迁移产生的多余节点去掉
        RelationNode targetRNode=relationNodeRepository.findOne(targetRNodeId);
        for(RelationToCEdge rtcEdge : targetRNode.getRtcEdges()) {
            String port=rtcEdge.getPort();
            String name=rtcEdge.getEdgeName();
            String fullName=port+"."+name;
            Long cid=rtcEdge.getEnder().getId();
            if(unNecessaryClassNodeMap.containsKey(fullName)&&unNecessaryValueNodeMap.get(fullName).contains(cid)) {
                //说明这个是新建的边
//                targetRNode.getCtvEdges().remove(ctvEdge);
                relationToCEdgeRepository.delete(rtcEdge);
            }
        }
        for(RelationToValueEdge rtvEdge : targetRNode.getRtvEdges()) {
            String port=rtvEdge.getPort();
            String name=rtvEdge.getEdgeName();
            String fullName=port+"."+name;
            Long vid=rtvEdge.getEnder().getId();
            if(unNecessaryValueNodeMap.containsKey(fullName)&&unNecessaryValueNodeMap.get(fullName).contains(vid)) {
                relationToVEdgeRepository.delete(rtvEdge);
            }
        }

        //下面这部分是正常的恢复流程
        for(ClassNode classNode : protectedClassNodes) {
            Long nid=classNode.getId();
            ClassNode waitUpdateClassNode=classNodeRepository.findOne(nid);//这个就是我们要还原的节点
            waitUpdateClassNode.UpdateClassNode(classNode);//更新class node节点
            classNodeRepository.save(waitUpdateClassNode);
        }

        for(RelationNode relationNode : protectedRelationNodes) {
            Long nid=relationNode.getId();
            RelationNode waitUpdateRelationNode=relationNodeRepository.findOne(nid);
            waitUpdateRelationNode.UpdateRelationNode(relationNode);//更新relation node节点
            relationNodeRepository.save(waitUpdateRelationNode);
        }

        //valueNode也需要修改,因为有边
        for(ValueNode valueNode : protectedValueNodes) {
            Long nid=valueNode.getId();
            ValueNode waitUpdateRelationNode=valueNodeRepository.findOne(nid);
            waitUpdateRelationNode.UpdateValueNode(valueNode);
            valueNodeRepository.save(waitUpdateRelationNode);
        }

        for(RelationToValueEdge relationToValueEdge : protectedRelationToVEdges) {
            Long nid=relationToValueEdge.getId();
            RelationToValueEdge waitUpdateRelationToVENode=relationToVEdgeRepository.findOne(nid);
            waitUpdateRelationToVENode.UpdateRelationToVEdge(relationToValueEdge);
            relationToVEdgeRepository.save(waitUpdateRelationToVENode);
        }

        for(RelationToCEdge relationToCEdge : protectedRelationToCEdges) {
            Long nid=relationToCEdge.getId();
            RelationToCEdge waitUpdateRelationToCENode=relationToCEdgeRepository.findOne(nid);
            waitUpdateRelationToCENode.UpdateRelationToCEdge(relationToCEdge);
            relationToCEdgeRepository.save(waitUpdateRelationToCENode);
        }
    }


    private void findUnNecessaryClassNodeEdge(Long curIcmId,ClassNode sourceCNode,ClassNode targetCNode,
                                              Map<String,Set<Long>> unNecessaryValueNodeMap,
                                              Map<String,Set<Long>> unNecessaryRelationNodeMap) {
        Map<String,Set<Long>> targetCToVNodeMap=new HashMap<>();//收集的是value节点的id
        Map<String,Set<Long>> targetRToCNodeMap=new HashMap<>();//收集的是relation节点的id

        //这一步是先搜集targetCNode节点所有的边
        for(ClassToValueEdge classToValueEdge : targetCNode.getCtvEdges()) {
            String edgeName=classToValueEdge.getEdgeName();
            if(targetCToVNodeMap.containsKey(edgeName)) {//一个边名,多个value节点
                targetCToVNodeMap.get(edgeName).add(classToValueEdge.getEnder().getId());
            }else {
                Set<Long> set=new HashSet<>();
                set.add(classToValueEdge.getEnder().getId());
                targetCToVNodeMap.put(edgeName,set);
            }
        }
        for(RelationToCEdge relationToCEdge : targetCNode.getRtcEdges()) {
            String port=relationToCEdge.getPort();
            String edgeName=relationToCEdge.getEdgeName();
            String fullName=port+"."+edgeName;
            if(targetRToCNodeMap.containsKey(fullName)) {
                targetRToCNodeMap.get(fullName).add(relationToCEdge.getStarter().getId());
            }else {
                Set<Long> set=new HashSet<>();
                set.add(relationToCEdge.getStarter().getId());
                targetRToCNodeMap.put(fullName,set);
            }
        }

        //然后看sourceCNode的所有边,是否有和targetCNode指向相同的节点
        for(ClassToValueEdge ctvEdge : sourceCNode.getCtvEdges()) {
            if(!ctvEdge.getIcmList().contains(curIcmId)) continue;
            String edgeName=ctvEdge.getEdgeName();
            Long vid=ctvEdge.getEnder().getId();
            if(targetCToVNodeMap.containsKey(edgeName)&&targetCToVNodeMap.get(edgeName).contains(vid)) {//说明targetNode原本就存在对应的边
                continue;
            }else {
                if(unNecessaryValueNodeMap.containsKey(edgeName)) {
                    unNecessaryValueNodeMap.get(edgeName).add(vid);
                }
                else {
                    Set<Long> set=new HashSet<>();
                    set.add(vid);
                    unNecessaryValueNodeMap.put(edgeName,set);
                }
            }
        }

        for(RelationToCEdge rtcEdge : sourceCNode.getRtcEdges()) {
            if(!rtcEdge.getIcmList().contains(curIcmId)) continue;
            String port=rtcEdge.getPort();
            String name=rtcEdge.getEdgeName();
            String fullName=port+"."+name;
            Long rid=rtcEdge.getStarter().getId();
            if(targetRToCNodeMap.containsKey(fullName)&&targetRToCNodeMap.get(fullName).contains(rid)) {
                continue;
            }else {
                if(unNecessaryRelationNodeMap.containsKey(fullName)) {
                    unNecessaryRelationNodeMap.get(fullName).add(rid);
                }else {
                    Set<Long> set=new HashSet<>();
                    set.add(rid);
                    unNecessaryRelationNodeMap.put(fullName,set);
                }
            }
        }
    }

    private void findUnNecessaryRelationNodeEdge(Long curIcmId , RelationNode sourceRNode , RelationNode targetRNode ,
                                                 Map<String , Set<Long>> unNecessaryValueNodeMap ,
                                                 Map<String , Set<Long>> unNecessaryClassNodeMap) {
        Map<String,Set<Long>> targetRToCNodeMap=new HashMap<>();//收集的全是Class节点的id
        Map<String,Set<Long>> targetRToVNodeMap=new HashMap<>();//收集的全是Value节点的id
        //这一步是先搜集targetRNode节点所有的边
        for(RelationToCEdge rtcEdge : targetRNode.getRtcEdges()) {
            String port=rtcEdge.getPort();
            String name=rtcEdge.getEdgeName();
            String fullName=port+"."+name;
            if(targetRToCNodeMap.containsKey(fullName)) {
                targetRToCNodeMap.get(fullName).add(rtcEdge.getEnder().getId());
            }else {
                Set<Long> set=new HashSet<>();
                set.add(rtcEdge.getEnder().getId());
                targetRToCNodeMap.put(fullName,set);
            }
        }
        for(RelationToValueEdge rtvEdge : targetRNode.getRtvEdges()) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            String fullName=port+"."+edgeName;
            if(targetRToVNodeMap.containsKey(fullName)) {
                targetRToVNodeMap.get(fullName).add(rtvEdge.getEnder().getId());
            }else {
                Set<Long> set=new HashSet<>();
                set.add(rtvEdge.getEnder().getId());
                targetRToVNodeMap.put(fullName,set);
            }
        }

        //然后看sourceRNode的所有边,是否有和targetRNode指向相同的节点
        for(RelationToCEdge rtcEdge : sourceRNode.getRtcEdges()) {
            if(!rtcEdge.getIcmList().contains(curIcmId)) continue;
            String port=rtcEdge.getPort();
            String name=rtcEdge.getEdgeName();
            String fullName=port+"."+name;
            Long cid=rtcEdge.getEnder().getId();//class node的id
            if(targetRToCNodeMap.containsKey(fullName)&&targetRToCNodeMap.get(fullName).contains(cid)) {//说明targetNode原本就存在对应的边
                continue;
            }else {
                if(unNecessaryClassNodeMap.containsKey(fullName)) {
                    unNecessaryClassNodeMap.get(fullName).add(cid);
                }
                else {
                    Set<Long> set=new HashSet<>();
                    set.add(cid);
                    unNecessaryClassNodeMap.put(fullName,set);
                }
            }
        }

        for(RelationToValueEdge rtvEdge : sourceRNode.getRtvEdges()) {
            if(!rtvEdge.getIcmList().contains(curIcmId)) continue;
            String port=rtvEdge.getPort();
            String name=rtvEdge.getEdgeName();
            String fullName =port+"."+name;
            Long vid=rtvEdge.getEnder().getId();
            if(targetRToVNodeMap.containsKey(fullName)&&targetRToVNodeMap.get(fullName).contains(vid)) {
                continue;
            }else {
                if(unNecessaryValueNodeMap.containsKey(fullName)) {
                    unNecessaryValueNodeMap.get(fullName).add(vid);
                }else {
                    Set<Long> set=new HashSet<>();
                    set.add(vid);
                    unNecessaryValueNodeMap.put(fullName,set);
                }
            }
        }
    }

}
