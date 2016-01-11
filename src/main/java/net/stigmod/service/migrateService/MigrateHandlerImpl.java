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

//    @Autowired
//    private MigrateUtil migrateUtil;

//    @Autowired
//    private EntropyHandler entropyHandler;

    private MigrateUtil migrateUtil=new MigrateUtil();

    private EntropyHandler entropyHandler=new EntropyHandlerImpl();

    private List<ClassNode> classNodeList;

    private List<RelationNode> relationNodeList;

    private List<ValueNode> valueNodeList;

    private boolean isStable=false;

    private Long modelId;

    private int userNum;

    /**
     * 初始化
     * @param id (the id is ccm id)
     * 每次执行migrateHandler进行融合操作之前,都需要执行一次migrateInit方法(当然该方法自动在migrateHandler中被调用)
     */
    private void migrateInit(Long id) {
        //获取ccm对象
        CollectiveConceptualModel ccm=collectiveConceptualModelRepository.findOne(id);

        //获取ccm中各种node的数据
        this.classNodeList=convertClassIdToObj(ccm.getClassNodesId());
        this.relationNodeList=convertRelationIdToObj(ccm.getRelationNodesId());
        this.valueNodeList=convertValueIdToObj(ccm.getValueNodesId());

        modelId=ccm.getModelId();

        //获取ccm种各种edge的数据
//        this.ctvEdgeList=classToVEdgeRepository.findByModelId(modelId);
//        this.rtcEdgeList=relationToCEdgeRepository.findByModelId(modelId);
//        this.rtvEdgeList=relationToVEdgeRepository.findByModelId(modelId);//之所以预先全部获取的原因在于不想在融合的过程中发生数据库存取操作

        //初始化isStable函数
        this.isStable=false;
    }

    public void migrateInitForTest(List<ClassNode> classNodeList , List<RelationNode> relationNodeList ,
                                    List<ValueNode> valueNodeList , int userNum) {
        modelId=0l;
        this.classNodeList = classNodeList;
        this.relationNodeList = relationNodeList;
        this.valueNodeList = valueNodeList;
        this.isStable=false;
        this.userNum=userNum;
    }

    @Override
    public void migrateHandler(Long id) {//初始化各变量
//        migrateInit(id);
        int cNum=classNodeList.size();
        int rNum=relationNodeList.size();
        int iterNum=(cNum+rNum)*2;
        int curIterNum=0;
//        int[] randArr={3,21,16,3,12,0,7,3,25,25,3,4,10,8,14,22,3,10,3,9,21,20,1,18,19,13,20,21,17,18,19,17,18,19,20,21,22,23,16};
        int[] randArr={2,3,4,5,6,7,8,9,10,11,12,13};
        int t=0;
        while(true) {//此代码中采用的融合算法规则为随机选择节点进行融合迁移判断
            isStable=true;//在migrateClassNode和migrateRelationNode中若发生迁移则会由isStable转为false;
            int randValue=randomValue();
            randValue=randArr[t];
            t++; //测试用
            if(t==500) {
                System.out.println("123!");
            }
            System.out.println("随机值: " + randValue);
            cNum=classNodeList.size();//要不断更新cNum的值
            if(randValue<cNum) migrateClassNode(randValue);
            else migrateRelationNode(randValue - cNum);
            if(isStable&&curIterNum>iterNum) break;
            else if(isStable) curIterNum++;
            else curIterNum=0;
        }
        System.out.println("迭代结束啦~");
    }

    private void migrateClassNode(int classNodeListId) {
        ClassNode classNode = classNodeList.get(classNodeListId);
        if(classNode.getIcmSet().size()==0) return ;
        Set<Long> icmIdSet = new HashSet<>(classNode.getIcmSet());
        for(Long icmId : icmIdSet) {
            findLowerEntropyLocForClass(icmId , classNodeListId);
        }
    }

    private void migrateRelationNode(int relationNodeListId) {
        RelationNode relationNode = relationNodeList.get(relationNodeListId);
        if(relationNode.getIcmSet().size()==0) return ;
        Set<Long> icmIdSet=new HashSet<>(relationNode.getIcmSet());
        for(Long icmId:icmIdSet) {
            findLowerEntropyLocForRelation(icmId , relationNodeListId);
        }
    }

    private void findLowerEntropyLocForClass(Long icmId , int sourceClassNodeListId) {
        //注意,这里的ListId不是Node本身的id,而是classNodeList中该节点的id.
        //!!!要区分ListId和Id的区别
        double maxEntropyDecrease = 0.0;
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);
        int targetClassNodeListId = -1; //因为我们目标是全局最小的熵值节点
        Set<Integer> alreadyHasCurIcmClassNodeListId = new HashSet<>();//这个集合放入的元素全部是和classNode一样拥有icmId用户的节点
        boolean isTravseNullNode = false;//标注是否遍历过包含0用户的节点(即空节点)

        for(int i=0;i<classNodeList.size();i++) {//遍历classNodeList,找出使classNode节点迁移icmId用户后下降最多的节点
            if(i==sourceClassNodeListId) continue;//本身
            ClassNode tmpCNode = classNodeList.get(i);
            if(isTravseNullNode && tmpCNode.getIcmSet().size()==0) continue;
            if(tmpCNode.getIcmSet().size() == 0) isTravseNullNode = true;
            if(tmpCNode.getIcmSet().contains(icmId)) {
                alreadyHasCurIcmClassNodeListId.add(i);
                continue;//如果是同样包含有该用户的节点,则先保存在already中,保存的是在classNodeList中该节点的ListId号.
            }
            double var = simulateMigrateForClass(icmId , sourceClassNode , tmpCNode);
            if(Double.compare(maxEntropyDecrease , var) > 0 ||
                    (Double.compare(var,0.0) == 0 && sourceClassNode.getIcmSet().size() == 1)) {
                maxEntropyDecrease = var;
                targetClassNodeListId = i;
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isTravseNullNode) {
            ClassNode classNode2 = new ClassNode();
            double var2 = simulateMigrateForClass(icmId,sourceClassNode,classNode2);
            if(Double.compare(maxEntropyDecrease , var2) > 0) {
//                classNodeRepository.save(classNode2);//在数据库中保存该节点
                classNodeList.add(classNode2);//在classNodeList中添加节点classNode2
                maxEntropyDecrease = var2;
                targetClassNodeListId = classNodeList.size()-1;
            }
        }

        if(targetClassNodeListId!=-1) {
            migrateClassNodeForOneStep(icmId , sourceClassNodeListId , targetClassNodeListId);
            System.out.println("发生迁移操作,位置201行");
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }

        //2: 判断该用户迁移到其他包含该用户的节点上,系统熵值是否会下降
        if(targetClassNodeListId==-1) {
            for(Integer listId : alreadyHasCurIcmClassNodeListId) {
                double twoStepVar=migrateClassNodeNeedTwoStep(icmId , sourceClassNodeListId ,listId);
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

        Map<String,List<Set<Long>>>  oldSourceMap =
                entropyHandler.getMapForClassNode(sourceCNode.getCtvEdges(),sourceCNode.getRtcEdges());
        Map<String,List<Set<Long>>>  oldTargetMap =
                entropyHandler.getMapForClassNode(targetCNode.getCtvEdges(),targetCNode.getRtcEdges());

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
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */
    public void migrateClassNodeForOneStep(Long icmId,int sourceClassNodeListId,int targetClassNodeListId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);

        sourceClassNode.getIcmSet().remove(icmId);
        targetClassNode.getIcmSet().add(icmId);

        //对于sourceClassNode的classToValue部分
        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges()) {
            if(ctvEdge.getIcmList().size()==0||!ctvEdge.getIcmList().contains(icmId)) {
                ctvEdge.setIsChanged(false);
                continue;
            }

            ctvEdge.setIcmListPreCopy(new HashSet<>(ctvEdge.getIcmList()));//将这个存储一个备份
            ctvEdge.setIsChanged(true);//标记这个值被改变了

            ctvEdge.getIcmList().remove(icmId);
            String edgeName=ctvEdge.getEdgeName();
            ValueNode valueNode=ctvEdge.getEnder();
            //下面要把该边上的该用户从sourceClassNode迁移到targetClassNode
            boolean isContainFlag=false;
            for(ClassToValueEdge ctvEdge2 : targetClassNode.getCtvEdges()) {
                if (ctvEdge2.getEdgeName().equals(edgeName) && ctvEdge2.getEnder().equals(valueNode)) {
                    ctvEdge2.setIcmListPreCopy(new HashSet<Long>(ctvEdge2.getIcmList()));//将这个存储一个备份
                    ctvEdge2.setIsChanged(true);
                    isContainFlag=true;
                    ctvEdge2.getIcmList().add(icmId);
                    break;
                }else ctvEdge2.setIsChanged(false);
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                ClassToValueEdge tmpCtvEdge=new ClassToValueEdge(edgeName,targetClassNode,valueNode);
                tmpCtvEdge.setIcmList(tTmpSet);
                tmpCtvEdge.setIsChanged(true);
                tmpCtvEdge.setIcmListPreCopy(new HashSet<Long>());
                targetClassNode.getCtvEdges().add(tmpCtvEdge);
                valueNode.getCtvEdges().add(tmpCtvEdge);
//                classToVEdgeRepository.save(tmpCtvEdge);//classToVEdgeRepository这个
            }
        }

        //对于sourceClassNode的relationToClass部分
        for(RelationToCEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            if(rtcEdge.getIcmList().size()==0||!rtcEdge.getIcmList().contains(icmId)) {
                rtcEdge.setIsChanged(false);
                continue;
            }
            rtcEdge.setIcmListPreCopy(new HashSet<>(rtcEdge.getIcmList()));//将这个存储一个备份
            rtcEdge.setIsChanged(true);
            rtcEdge.getIcmList().remove(icmId);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            RelationNode relationNode=rtcEdge.getStarter();
            //下面要把改变上的该用户从sourceClassNode迁移到targetClassNode上去
            boolean isContainFlag=false;
            for(RelationToCEdge rtcEdge2 : targetClassNode.getRtcEdges()) {
                if(rtcEdge2.getPort().equals(port)&&rtcEdge2.getEdgeName().equals(edgeName)
                        &&rtcEdge2.getStarter().equals(relationNode)) {
                    rtcEdge2.setIcmListPreCopy(new HashSet<Long>(rtcEdge2.getIcmList()));//将这个存储一个备份
                    rtcEdge2.setIsChanged(true);
                    isContainFlag=true;
                    rtcEdge2.getIcmList().add(icmId);
                    break;
                }else rtcEdge2.setIsChanged(false);
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                RelationToCEdge tmpRtcEdge=new RelationToCEdge(port,edgeName,relationNode,targetClassNode);
                tmpRtcEdge.setIcmList(tTmpSet);
                targetClassNode.getRtcEdges().add(tmpRtcEdge);
                tmpRtcEdge.setIsChanged(true);
                tmpRtcEdge.setIcmListPreCopy(new HashSet<Long>());
                relationNode.getRtcEdges().add(tmpRtcEdge);
//                relationToCEdgeRepository.save(tmpRtcEdge);
            }
        }
    }

    /**
     * 目标是返回当前sourceClass上的用户迁移到targetClass上系统熵值减小/增加幅度
     * @param icmId
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */
    public Double migrateClassNodeNeedTwoStep(Long icmId,int sourceClassNodeListId,int targetClassNodeListId) {
        //首先是判断如果targetClass没有当前icmId用户,将sourceClass上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetClass上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);

        //由于在模拟迁移之后若系统总熵值不能减小,我们则需要将这些节点还原

        double minEntropyDown=0x7FFFFFFF;
        Integer minVarCNodeListId=-1;  //我们希望找到的是引起targetClass节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况

        //这里的目标是把target上的class节点迁移到otherClassNode上去,看看是否有效果
        for(int i=0;i<classNodeList.size();i++) {
            if(i==targetClassNodeListId||i==sourceClassNodeListId) continue;
            ClassNode otherClassNode = classNodeList.get(i);
            if(otherClassNode.getIcmSet().contains(icmId)) continue;
            double var=simulateMigrateForClass(icmId,targetClassNode,otherClassNode);
            if(otherClassNode.getIcmSet().size()==0) isTravseNUllNode=true;
            if(Double.compare(minEntropyDown,var)>0 ||
                    (Double.compare(var,0.0)==0 && targetClassNode.getIcmSet().size() == 1)) {
                minEntropyDown=var;
                minVarCNodeListId=i;
            }
        }

        boolean isUsedNullNode = false;//是否使用了空节点
        if(!isTravseNUllNode) {
            ClassNode tClassNode=new ClassNode();
            double var=simulateMigrateForClass(icmId,targetClassNode,tClassNode);
            if(Double.compare(minEntropyDown,var)>0) {
                isUsedNullNode=true;
                minEntropyDown=var;
                classNodeList.add(tClassNode);
                minVarCNodeListId=classNodeList.size()-1;
            }else tClassNode=null;
        }

        if(minVarCNodeListId!=-1) {//说明确实找到了可以让该节点熵值下降的通道

            //将targetClass上的icmId正式迁移到minVarCNodeId节点上去
            migrateClassNodeForOneStep(icmId, targetClassNodeListId, minVarCNodeListId);
            //如果需要恢复到迁移前,则在下面启动恢复过程
        }
        //上面这个migrateClassNodeForOneStep实实在在的把targetClassNode上的icmId迁移到了minVarCNodeId对应节点上

        double simVar=simulateMigrateForClass(icmId,sourceClassNode,targetClassNode);
        if(Double.compare(simVar,0.0)>=0) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0) > 0 ||
                    (Double.compare(minEntropyDown,0.0) == 0 && !(targetClassNode.getIcmSet().size() == 0 &&
                            classNodeList.get(minVarCNodeListId).getIcmSet().size()>1)) ) {
                //需要复原之前的迁移
                recoverMigrateStateForClassNode(icmId,targetClassNodeListId,minVarCNodeListId,isUsedNullNode);
                recoverEdgeStateForClassNode(targetClassNodeListId);
                recoverEdgeStateForClassNode(minVarCNodeListId);
            }else {
                System.out.println("发生迁移操作,位置535行");
                isStable=false;
            }//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>0 ||
                 (Double.compare(minEntropyDown,0.0) == 0 && !(targetClassNode.getIcmSet().size() == 0 &&
                         classNodeList.get(minVarCNodeListId).getIcmSet().size()>1))) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>=0) {//说明迁移后系统熵值减小,这是成功的
                    migrateClassNodeForOneStep(icmId,sourceClassNodeListId,targetClassNodeListId);
                    isStable=false;
                    System.out.println("发生迁移操作,位置546行");
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForClassNode(icmId,targetClassNodeListId,minVarCNodeListId,isUsedNullNode);//还原节点的原有格局
                    recoverEdgeStateForClassNode(targetClassNodeListId);
                    recoverEdgeStateForClassNode(minVarCNodeListId);
                }
            }else {
                //成功,我们需要将souceClass上的icmId用户迁移到targetClass上去
                migrateClassNodeForOneStep(icmId,sourceClassNodeListId,targetClassNodeListId);
                isStable=true;
                System.out.println("发生迁移操作,位置555行");
            }
        }
        return simVar+minEntropyDown;
    }

    private void findLowerEntropyLocForRelation(Long icmId , int sourceRelationNodeListId) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);
        double maxEntropyDecrease=0.0;
        int targetRelationNodeId=-1;
        Set<Integer> alreadyHasCurIcmRelationNodeListId = new HashSet<>();//这个集合放入的元素全部是和relationNode一样拥有icmId用户的节点
        boolean isNullNode=false;

        for(int i=0;i<relationNodeList.size();i++) {
            if(i==sourceRelationNodeListId) continue;
            RelationNode tmpRNode=relationNodeList.get(i);
            if(isNullNode&&tmpRNode.getIcmSet().size()==0) continue;
            if(tmpRNode.getIcmSet().size()==0) isNullNode=true;
            if(tmpRNode.getIcmSet().contains(icmId)) {
                alreadyHasCurIcmRelationNodeListId.add(i);
                continue;//如果是同样包含有该用户的节点,则先保存在already中.
            }
            double var=simulateMigrateForRelation(icmId, sourceRelationNode, tmpRNode);
            if(Double.compare(maxEntropyDecrease,var)>0 ||
                    (Double.compare(var , 0.0) == 0 && sourceRelationNode.getIcmSet().size() == 1)) {
                maxEntropyDecrease=var;
                targetRelationNodeId=i;
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isNullNode) {
            RelationNode relationNode2=new RelationNode();
            double var2=simulateMigrateForRelation(icmId, sourceRelationNode, relationNode2);
            if(Double.compare(maxEntropyDecrease,var2)>0) {
                relationNodeList.add(relationNode2);
                maxEntropyDecrease=var2;
                targetRelationNodeId=relationNodeList.size()-1;
            }
        }

        if(targetRelationNodeId!=-1) {
            migrateRelationNodeForOneStep(icmId, sourceRelationNodeListId, targetRelationNodeId);
            System.out.println("发生迁移操作,位置596行");
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }

        //2: 判断该用户迁移到其他包含该用户的节点上,系统熵值是否会下降
        if(targetRelationNodeId==-1) {
            for(Integer listId : alreadyHasCurIcmRelationNodeListId) {
                double twoStepVar=migrateRelationNodeNeedTwoStep(icmId , sourceRelationNodeListId ,listId);
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
                entropyHandler.getMapForRelationNode(targetRNode.getRtcEdges(),targetRNode.getRtvEdges());

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

    public void migrateRelationNodeForOneStep(Long icmId,Integer sourceRelationNodeListId,Integer targetRelationNodeListId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

        sourceRelationNode.getIcmSet().remove(icmId);
        targetRelationNode.getIcmSet().add(icmId);

        //对于sourceRelationNode的RelationToValue部分
        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            if(rtvEdge.getIcmList().size()==0||!rtvEdge.getIcmList().contains(icmId)) {
                rtvEdge.setIsChanged(false);
                continue;
            }

            rtvEdge.setIcmListPreCopy(new HashSet<>(rtvEdge.getIcmList()));//将这个存储一个备份
            rtvEdge.setIsChanged(true);
            rtvEdge.getIcmList().remove(icmId);
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getEdgeName();
            ValueNode valueNode=rtvEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode
            boolean isContainFlag=false;
            for(RelationToValueEdge rtvEdge_target : targetRelationNode.getRtvEdges()) {
                if (rtvEdge_target.getPort().equals(port) && rtvEdge_target.getEdgeName().equals(edgeName)
                        && rtvEdge_target.getEnder().getId().equals(valueNode.getId())) {

                    rtvEdge_target.setIcmListPreCopy(new HashSet<Long>(rtvEdge_target.getIcmList()));//将这个存储一个备份
                    rtvEdge_target.setIsChanged(true);
                    isContainFlag=true;//targetRelationNode中已经包含了该节点
                    rtvEdge_target.getIcmList().add(icmId);
                    break;
                }else rtvEdge_target.setIsChanged(false);
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                RelationToValueEdge tmpRtvEdge=new RelationToValueEdge(port,edgeName,targetRelationNode,valueNode);
                tmpRtvEdge.setIcmList(tTmpSet);
                tmpRtvEdge.setIsChanged(true);
                tmpRtvEdge.setIcmListPreCopy(new HashSet<Long>());
                targetRelationNode.getRtvEdges().add(tmpRtvEdge);//我觉得这句话可以去掉的
                valueNode.getRtvEdges().add(tmpRtvEdge);//这句应该也可以去掉的
//                relationToVEdgeRepository.save(tmpRtvEdge);//relationToVEdgeRepository这个
            }
        }

        //对于sourceRelationNode的relationToClass部分
        for(RelationToCEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            if(rtcEdge.getIcmList().size()==0||!rtcEdge.getIcmList().contains(icmId)) {
                rtcEdge.setIsChanged(false);
                continue;
            }

            rtcEdge.setIcmListPreCopy(new HashSet<>(rtcEdge.getIcmList()));//将这个存储一个备份
            rtcEdge.setIsChanged(true);
            rtcEdge.getIcmList().remove(icmId);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getEdgeName();
            ClassNode classNode=rtcEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode上去
            boolean isContainFlag=false;
            for(RelationToCEdge rtcEdge_target : targetRelationNode.getRtcEdges()) {
                if(rtcEdge_target.getPort().equals(port) && rtcEdge_target.getEdgeName().equals(edgeName)
                        && rtcEdge_target.getEnder().getId().equals(classNode.getId())) {
                    rtcEdge_target.setIsChanged(true);
                    rtcEdge_target.setIcmListPreCopy(new HashSet<>(rtcEdge_target.getIcmList()));//将这个存储一个备份
                    isContainFlag=true;
                    rtcEdge_target.getIcmList().add(icmId);
                    break;
                }else rtcEdge_target.setIsChanged(false);
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.add(icmId);
                RelationToCEdge tmpRtcEdge=new RelationToCEdge(port,edgeName,targetRelationNode,classNode);
                tmpRtcEdge.setIcmList(tTmpSet);
                tmpRtcEdge.setIsChanged(true);
                tmpRtcEdge.setIcmListPreCopy(new HashSet<Long>());
                targetRelationNode.getRtcEdges().add(tmpRtcEdge);
                classNode.getRtcEdges().add(tmpRtcEdge);
            }
        }
    }

    public Double migrateRelationNodeNeedTwoStep(Long icmId,Integer sourceRelationNodeListId,Integer targetRelationNodeListId) {
        //首先是判断如果targetRelation没有当前icmId用户,将sourceRelation上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetRelation上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

        double minEntropyDown=0x7FFFFFFF;
        Integer minVarRNodeId=-1;  //我们希望找到的是引起targetRelation节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况
        //这里的目标是把target上的relation节点迁移到otherRelationNode上去,看看是否有效果
        for(int i=0;i<relationNodeList.size();i++) {
            if(i==sourceRelationNodeListId||i==targetRelationNodeListId) continue;
            RelationNode otherRelationNode = relationNodeList.get(i);
            if(otherRelationNode.getIcmSet().contains(icmId)) continue;
            double var=simulateMigrateForRelation(icmId,targetRelationNode,otherRelationNode);
            if(otherRelationNode.getIcmSet().size()==0) isTravseNUllNode=true;
            if(Double.compare(minEntropyDown,var)>0 ||
                    (Double.compare(var,0.0)==0 && targetRelationNode.getIcmSet().size()==1)) {
                minEntropyDown=var;
                minVarRNodeId=i;
            }
        }
        boolean isUsedNullNode = false;
        if(!isTravseNUllNode) {
            RelationNode tRelationNode=new RelationNode();
            double var=simulateMigrateForRelation(icmId,targetRelationNode,tRelationNode);
            if(Double.compare(minEntropyDown,var)>0) {
                isUsedNullNode=true;
                minEntropyDown=var;
                relationNodeList.add(tRelationNode);
                minVarRNodeId=relationNodeList.size()-1;
            }else tRelationNode=null;
        }

        if(minVarRNodeId!=-1) {//说明确实找到了可以让该节点熵值下降的通道

            //将targetRelation上的icmId正式迁移到minVarRNodeId节点上去
            migrateRelationNodeForOneStep(icmId, targetRelationNodeListId, minVarRNodeId);
            //如果需要恢复到迁移前,则在下面启动恢复过程
        }
        //上面这个migrateRelationNodeForOneStep实实在在的把targetRelationNode上的icmId迁移到了minVarRNodeId对应节点上

        double simVar=simulateMigrateForRelation(icmId, sourceRelationNode, targetRelationNode);
        if(Double.compare(simVar,0.0)>=0) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0)>0 ||
                    (Double.compare(minEntropyDown,0.0)==0 && !(targetRelationNode.getIcmSet().size()==0
                    && relationNodeList.get(minVarRNodeId).getIcmSet().size()>1))) {
                //需要复原之前的迁移
                recoverMigrateStateForRelationNode(icmId,targetRelationNodeListId,minVarRNodeId,isUsedNullNode);//还原原有的节点格局
                recoverEdgeStateForRelationNode(targetRelationNodeListId);
                recoverEdgeStateForRelationNode(minVarRNodeId);
            }else {
                isStable=false;
                System.out.println("发生迁移操作,位置926行");
            }//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>=0 ||
                    (Double.compare(minEntropyDown,0.0)==0 && !(targetRelationNode.getIcmSet().size()==0
                            && relationNodeList.get(minVarRNodeId).getIcmSet().size()>1))) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>=0) {//说明迁移后系统熵值减小,这是成功的
                    migrateRelationNodeForOneStep(icmId, sourceRelationNodeListId, targetRelationNodeListId);
                    isStable=false;
                    System.out.println("发生迁移操作,位置936行");
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForRelationNode(icmId,targetRelationNodeListId,minVarRNodeId,isUsedNullNode);//还原原有的节点格局
                    recoverEdgeStateForRelationNode(targetRelationNodeListId);
                    recoverEdgeStateForRelationNode(minVarRNodeId);
                }
            }else {
                //成功,我们需要将souceRelation上的icmId用户迁移到targetRelation上去
                migrateClassNodeForOneStep(icmId,sourceRelationNodeListId,targetRelationNodeListId);
                isStable=false;
                System.out.println("发生迁移操作,位置944行");
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
     *这是用于两步迁移时的回复
     * @param icmId
     * @param targetClassNodeListId
     * @param minVarCNodeListId
     */
    private void recoverMigrateStateForClassNode(Long icmId,int targetClassNodeListId,
                                                 int minVarCNodeListId,boolean isUsedNullNode) {
        ClassNode sourceCNode = classNodeList.get(targetClassNodeListId);
        sourceCNode.getIcmSet().add(icmId);

        if(!isUsedNullNode) {
            ClassNode targetCNode = classNodeList.get(minVarCNodeListId);
            targetCNode.getIcmSet().remove(icmId);
        }else {
            //这个不是仅仅删除节点这么简单,还要删除边,以及边另一端的节点
            ClassNode tmpCNode =classNodeList.get(minVarCNodeListId);
            for(ClassToValueEdge ctvEdge : tmpCNode.getCtvEdges()) {
                ctvEdge.getEnder().getCtvEdges().remove(ctvEdge);
            }
            for(RelationToCEdge rtcEdge : tmpCNode.getRtcEdges()) {
                rtcEdge.getStarter().getRtcEdges().remove(rtcEdge);
            }
            classNodeList.remove(classNodeList.size()-1);
        }
    }

    private void recoverMigrateStateForRelationNode(Long icmId,int targetRelationNodeListId,
                                                    int minVarRNodeListId,boolean isUsedNullNode) {
        RelationNode relationRNode = relationNodeList.get(targetRelationNodeListId);
        relationRNode.getIcmSet().add(icmId);

        if(!isUsedNullNode) {
            RelationNode targetRNode = relationNodeList.get(minVarRNodeListId);
            targetRNode.getIcmSet().remove(icmId);
        }else {
            RelationNode tmpRNode =relationNodeList.get(minVarRNodeListId);
            for(RelationToValueEdge rtvEdge : tmpRNode.getRtvEdges()) {
                rtvEdge.getEnder().getRtvEdges().remove(rtvEdge);
            }
            for(RelationToCEdge rtcEdge : tmpRNode.getRtcEdges()) {
                rtcEdge.getEnder().getRtcEdges().remove(rtcEdge);
            }
            relationNodeList.remove(relationNodeList.size()-1);
        }
    }

    private void recoverEdgeStateForClassNode(int classNodeListId) {
        if(classNodeListId >= classNodeList.size()) return;
        ClassNode cNode = classNodeList.get(classNodeListId);
        for(RelationToCEdge rtcEdge : cNode.getRtcEdges()) {
            if(!rtcEdge.isChanged()) continue;
            else {
                rtcEdge.setIcmList(new HashSet<Long>(rtcEdge.getIcmListPreCopy()));
                rtcEdge.setIsChanged(false);
            }
        }

        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            if(!ctvEdge.isChanged()) continue;
            else {
                ctvEdge.setIcmList(new HashSet<Long>(ctvEdge.getIcmListPreCopy()));
                ctvEdge.setIsChanged(false);
            }
        }
    }

    private void  recoverEdgeStateForRelationNode(int relationNodeListId) {
        if(relationNodeListId >= relationNodeList.size()) return;
        RelationNode rNode = relationNodeList.get(relationNodeListId);
        for(RelationToCEdge rtcEdge : rNode.getRtcEdges()) {
            if(!rtcEdge.isChanged()) continue;
            else {
                rtcEdge.setIcmList(new HashSet<Long>(rtcEdge.getIcmListPreCopy()));
                rtcEdge.setIsChanged(false);
            }
        }

        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            if(!rtvEdge.isChanged()) continue;
            else {
                rtvEdge.setIcmList(new HashSet<Long>(rtvEdge.getIcmListPreCopy()));
                rtvEdge.setIsChanged(false);
            }
        }
    }


}
